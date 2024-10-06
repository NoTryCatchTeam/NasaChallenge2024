using System.Net.Http.Json;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using NasaChallenge2024.Definitions.Models;
using NasaChallenge2024.Layout;

namespace NasaChallenge2024.Pages;

public partial class Observatories : ComponentBase
{
    private bool _isSpaceObservatories = false;
    private bool _isEarthObservatoryWindowVisible;
    private bool _isSpaceObservatoryFloatingWindowVisible;

    [Inject]
    public IJSRuntime JsRuntime { get; set; }

    [Inject]
    NavigationManager NavigationManager { get; set; }

    [Inject]
    public HttpClient HttpClient { get; set; }

    private IJSObjectReference _mainJsModule;

    private string _id;
    private SpaceObservatoryWindow _spaceObservatoryWindowRef;
    private EarthObservatoryWindow _earthObservatoryWindowRef;
    private DotNetObjectReference<Observatories> _dotNet;
    private Observatory[] _observatories;

    [JSInvokable("OnEarthLabelClicked")]
    public void OnEarthLabelClicked(int id)
    {
        SelectEarthObservatory(_observatories.First(o => o.Id == id));
    }

    public void Dispose() => _dotNet?.Dispose();

    protected override void OnInitialized()
    {
        _dotNet = DotNetObjectReference.Create(this);

        var uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);

        _id = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query).TryGetValue("id", out var id) ? id : default(string);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender)
        {
            return;
        }

        _observatories = await HttpClient.GetFromJsonAsync<Observatory[]>("jsons/observatories.json");

        if (_id != null && _observatories.FirstOrDefault(o => o.Id.ToString() == _id) is { } observatory)
        {
            switch (observatory.Type)
            {
                case "Earth":
                    _isSpaceObservatories = false;
                    await SelectEarthObservatory(observatory);

                    break;
                default:
                    _isSpaceObservatories = true;
                    await SelectSpaceObservatory(observatory);

                    break;
            }
        }

        _mainJsModule = await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/scene.js");

        var earthObservatories = _observatories.Where(x => x.Type == "Earth").ToArray();

        if (await _mainJsModule.InvokeAsync<bool>("initObservatoriesScene", "#scene-canvas", earthObservatories))
        {
        }
        else
        {
            // In case of navigation
            await _mainJsModule.InvokeVoidAsync("showObservatoriesStateFirstTimeAsync", earthObservatories);
        }

        await _mainJsModule.InvokeVoidAsync("passDotNet", _dotNet);
    }

    private async Task ShowEarthObservatoriesAsync()
    {
        _isSpaceObservatories = false;
        await _mainJsModule.InvokeVoidAsync("showObservatoriesStateAsync", !_isSpaceObservatories);
    }

    private async Task ShowSpaceObservatoriesAsync()
    {
        _isSpaceObservatories = true;
        await _mainJsModule.InvokeVoidAsync("showObservatoriesStateAsync", !_isSpaceObservatories);
    }

    private string GetVisibilityStyle(bool visible) => visible ? string.Empty : "invisible";

    private async Task SelectSpaceObservatory(Observatory observatory)
    {
        _isEarthObservatoryWindowVisible = false;
        _spaceObservatoryWindowRef.SelectObservatory(observatory);
        _isSpaceObservatoryFloatingWindowVisible = true;
        StateHasChanged();
    }

    private async Task SelectEarthObservatory(Observatory observatory)
    {
        _isSpaceObservatoryFloatingWindowVisible = false;
        _earthObservatoryWindowRef.SelectObservatory(observatory);
        _isEarthObservatoryWindowVisible = true;
        StateHasChanged();
    }

    private void HandleSpaceObservatoryWindowCloseClickedEvent()
    {
        _isSpaceObservatoryFloatingWindowVisible = false;
        StateHasChanged();
    }

    private void HandleEarthObservatoryWindowCloseClickedEvent()
    {
        _isEarthObservatoryWindowVisible = false;
        StateHasChanged();
    }
}
