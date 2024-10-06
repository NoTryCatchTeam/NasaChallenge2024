using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace NasaChallenge2024.Pages;

public partial class Observatories : ComponentBase
{
    [Inject]
    public IJSRuntime JsRuntime { get; set; }
    
    [Inject]
    NavigationManager NavigationManager { get; set; }

    private IJSObjectReference _mainJsModule;
    
    private string _id;

    protected override void OnInitialized()
    {
        var uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);

        _id = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query).TryGetValue("id", out var id) ? id : default(string);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender)
        {
            return;
        }

        _mainJsModule = await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/scene.js");

        if (await _mainJsModule.InvokeAsync<bool>("initScene", "#scene-canvas"))
        {
            return;
        }

        // In case of navigation
        await _mainJsModule.InvokeVoidAsync("showObservatoriesStateAsync", true);
    }

    private async Task ShowSpaceObservatoriesAsync()
    {
        await _mainJsModule.InvokeVoidAsync("showObservatoriesStateAsync", false);
    }

    private async Task ShowEarthObservatoriesAsync()
    {
        await _mainJsModule.InvokeVoidAsync("showObservatoriesStateAsync", true);
    }
}
