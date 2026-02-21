using System.Reflection;
using System.Runtime.InteropServices;
using HikvisionSDKService.Services;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using PreviewDemo;

// ─── Fix DLL paths ─────────────────────────────────────────────────────────────
// CHCNetSDK.cs uses relative paths like @"..\bin\HCNetSDK.dll" from the old demo.
// Intercept all native DLL loads and redirect to the app's base directory
// where the DLLs are copied by the build.
NativeLibrary.SetDllImportResolver(typeof(CHCNetSDK).Assembly, (name, asm, paths) =>
{
    // Strip any directory prefix — just use the filename
    var file = Path.GetFileName(name);

    // Try app base directory first (where build copies the DLLs)
    var fullPath = Path.Combine(AppContext.BaseDirectory, file);
    if (File.Exists(fullPath))
        return NativeLibrary.Load(fullPath);

    // Fallback: let the runtime try its default resolution
    return IntPtr.Zero;
});

var builder = WebApplication.CreateBuilder(args);

// Use resilient controller provider that tolerates ReflectionTypeLoadException
// from CHCNetSDK's explicit-layout union structs (WIFI_AUTH_PARAM, etc.)
builder.Services
    .AddControllers()
    .ConfigureApplicationPartManager(manager =>
    {
        var existing = manager.FeatureProviders.OfType<ControllerFeatureProvider>().FirstOrDefault();
        if (existing != null) manager.FeatureProviders.Remove(existing);
        manager.FeatureProviders.Add(new SafeControllerFeatureProvider());
    });

builder.Services.AddSingleton<HikvisionService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowAll");

// Root endpoint - Status page
app.MapGet("/", () => Results.Content(@"
<!DOCTYPE html>
<html dir='rtl' lang='ar'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Hikvision SDK Service</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; padding: 20px;
        }
        .container {
            background: white; border-radius: 20px; padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px; width: 100%;
        }
        h1 { color: #667eea; margin-bottom: 10px; font-size: 2em; }
        .status { 
            display: inline-block; background: #10b981; color: white;
            padding: 8px 20px; border-radius: 20px; font-weight: bold;
            margin-bottom: 30px;
        }
        .info { background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .info-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-item:last-child { border-bottom: none; }
        .label { color: #6b7280; font-weight: 600; }
        .value { color: #1f2937; font-family: monospace; }
        .endpoints { margin-top: 30px; }
        .endpoint { 
            background: #eff6ff; border-left: 4px solid #3b82f6;
            padding: 15px; margin: 10px 0; border-radius: 5px;
        }
        .endpoint h3 { color: #1e40af; margin-bottom: 5px; font-size: 1.1em; }
        .endpoint p { color: #64748b; font-size: 0.9em; }
        .method { 
            display: inline-block; background: #3b82f6; color: white;
            padding: 4px 12px; border-radius: 5px; font-size: 0.8em;
            margin-left: 10px; font-weight: bold;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔌 Hikvision SDK Service</h1>
        <div class='status'>✅ Running</div>
        
        <div class='info'>
            <div class='info-item'>
                <span class='label'>الحالة</span>
                <span class='value'>نشط</span>
            </div>
            <div class='info-item'>
                <span class='label'>المنفذ (Port)</span>
                <span class='value'>5000</span>
            </div>
            <div class='info-item'>
                <span class='label'>الوقت</span>
                <span class='value'>" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"</span>
            </div>
        </div>

        <div class='endpoints'>
            <h2 style='color: #374151; margin-bottom: 15px;'>📡 API Endpoints</h2>
            
            <div class='endpoint'>
                <h3><span class='method'>GET</span> /api/face/health</h3>
                <p>فحص حالة الخدمة</p>
            </div>
            
            <div class='endpoint'>
                <h3><span class='method'>POST</span> /api/face/register</h3>
                <p>تسجيل بصمة الوجه على جهاز Hikvision</p>
            </div>
        </div>

        <div style='margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;'>
            <p>✨ خدمة التكامل مع أجهزة Hikvision عبر HCNetSDK</p>
        </div>
    </div>
</body>
</html>", "text/html; charset=utf-8"));

app.MapControllers();

app.Run("http://0.0.0.0:5000");

// ─── Resilient controller feature provider ─────────────────────────────────────
// ASP.NET scans ALL types in the assembly looking for controllers.
// CHCNetSDK.cs contains LayoutKind.Explicit union structs with managed (byte[]/string)
// fields that throw TypeLoadException on 64-bit .NET. This provider skips them.
//
// ControllerFeatureProvider.PopulateFeature is not virtual, so we implement
// IApplicationFeatureProvider<ControllerFeature> directly and use an inner
// subclass to access the protected IsController() method.
class SafeControllerFeatureProvider : IApplicationFeatureProvider<ControllerFeature>
{
    private readonly TypeChecker _checker = new();

    public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
    {
        foreach (var part in parts.OfType<AssemblyPart>())
        {
            IEnumerable<TypeInfo> types;
            try
            {
                types = part.Assembly.DefinedTypes;
            }
            catch (ReflectionTypeLoadException ex)
            {
                // Some SDK types fail to load — keep the loadable ones
                types = ex.Types
                    .Where(t => t != null)
                    .Select(t => t!.GetTypeInfo());
            }

            foreach (var typeInfo in types)
            {
                try
                {
                    if (_checker.IsControllerType(typeInfo))
                        feature.Controllers.Add(typeInfo);
                }
                catch { /* skip individual problematic types */ }
            }
        }
    }

    // Inner subclass exposes the protected IsController() method
    private class TypeChecker : ControllerFeatureProvider
    {
        public bool IsControllerType(TypeInfo t) => IsController(t);
    }
}
