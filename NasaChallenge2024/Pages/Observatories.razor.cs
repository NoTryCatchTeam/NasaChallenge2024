using System.Net.Http.Json;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using NasaChallenge2024.Definitions.Models;
using NasaChallenge2024.Layout;

namespace NasaChallenge2024.Pages;

public partial class Observatories : ComponentBase
{
    private bool _isSpaceObservatories;
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
    private Observatory _selectedObservatory;
    private double _screenWidth, _screenHalfHeight;
    private double? _spaceColumnWidth;
    private double _spaceElementsLeft = 225;
    private Observatory[] _spaceObservatories;

    protected override async Task OnInitializedAsync()
    {
        var uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);

        _id = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query).TryGetValue("id", out var id) ? id : default(string);
        
        _screenWidth = await JsRuntime.InvokeAsync<double>("getScreenWidth");
        _screenHalfHeight = await JsRuntime.InvokeAsync<double>("getScreenHeight") / 2;
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender)
        {
            return;
        }

        var observatories = await HttpClient.GetFromJsonAsync<Observatory[]>("jsons/observatories.json");
        
        _spaceObservatories = observatories.Where(o => o.Type == "Space").ToArray();

        if (_spaceObservatories.Length > 0 && (_screenWidth - _spaceElementsLeft) / _spaceObservatories.Length is var spaceElementWidth and > 0)
        {
            _spaceColumnWidth = spaceElementWidth;
        }

        if (_id != null && observatories.FirstOrDefault(o => o.Id.ToString() == _id) is { } observatory)
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

        if (await _mainJsModule.InvokeAsync<bool>("initObservatoriesScene", "#scene-canvas", observatories.Where(x => x.Type == "Earth").ToArray()))
        {
            return;
        }

        // In case of navigation
        await _mainJsModule.InvokeVoidAsync("showObservatoriesStateAsync", !_isSpaceObservatories);
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
        _selectedObservatory = observatory;
        _isEarthObservatoryWindowVisible = false;
        _spaceObservatoryWindowRef.SelectObservatory(observatory);
        _isSpaceObservatoryFloatingWindowVisible = true;
        StateHasChanged();
    }
    
    private async Task SelectEarthObservatory(Observatory observatory)
    {
        _selectedObservatory = observatory;
        _isSpaceObservatoryFloatingWindowVisible = false;
        _earthObservatoryWindowRef.SelectObservatory(observatory);
        _isEarthObservatoryWindowVisible = true;
        StateHasChanged();
    }
    
    private void HandleSpaceObservatoryWindowCloseClickedEvent()
    {
        _selectedObservatory = null;
        _isSpaceObservatoryFloatingWindowVisible = false;
        StateHasChanged();
    }
    
    private void HandleEarthObservatoryWindowCloseClickedEvent()
    {
        _selectedObservatory = null;
        _isEarthObservatoryWindowVisible = false;
        StateHasChanged();
    }
}
