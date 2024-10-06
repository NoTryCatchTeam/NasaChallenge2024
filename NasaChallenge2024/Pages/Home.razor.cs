using System.Net.Http.Json;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using NasaChallenge2024.Definitions.Constants;
using NasaChallenge2024.Definitions.Models;
using NasaChallenge2024.Services;

namespace NasaChallenge2024.Pages
{
    public partial class Home : ComponentBase
    {
        [Inject]
        IJSRuntime JsRuntime { get; set; }
        
        [Inject]
        HttpClient HttpClient { get; set; }
        
        [Inject]
        UiIVisibilityService UiIVisibilityService { get; set; }
        
        [Inject]
        NavigationManager NavigationManager { get; set; }
        
        private IJSObjectReference _mainJsModule;

        //var exoplanets = await Http.GetFromJsonAsync<Exoplanet[]>("jsons/exoplanets.json");
        //var observatories = await Http.GetFromJsonAsync<Observatory[]>("jsons/observatories.json");
        //var starts = await Http.GetFromJsonAsync<Star[]>("jsons/stars.json");
        //var telescopes = await Http.GetFromJsonAsync<Telescope[]>("jsons/telescopes.json");
        //var travelTypes = await Http.GetFromJsonAsync<TravelType[]>("jsons/travel-types.json");


        public SpaceObject SpaceObject { get; set; } = new SpaceObject
        {
            Name = "Kepler-186f",

            Number = 5,

            Distance = 580,
            EarthRadius = 0.1283f,

            DiscoveryYear = 2014,

            OrbitalRadius = 0.7048f,

            OrbitalPeriod = 228.8f,

            Status = "Published Confirmed",

            DetectedBy = "Transit",

            ObservedBy = "Kepler",

            Host = new SpaceObjectHost
            {
                Name = "Kepler 186",
                SolarTemp = "3748±75",
                SolarRadius = "0.539±0.015"

            }
        };

        public string TravelSpeed { get; set; }
        public string TravelTime { get; set; }


        [Parameter]
        public bool IsUIChecked { get; set; } = true;
        private bool _isUIChecked;
        private bool _isExoplanetsTableVisible;
        private string _id;
        private Star[] _stars;

        private string GetExoplanetElementsVisibility() => _isUIChecked && !_isExoplanetsTableVisible ? string.Empty : "invisible";
        
        private string GetExoplanetTabletElementsVisibility() => _isUIChecked && _isExoplanetsTableVisible ? string.Empty : "invisible";

        protected override void OnParametersSet()
        {
            _isUIChecked = this.IsUIChecked;
            OnDistanceChange(new ChangeEventArgs() { Value = "light" });
        }
        
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

            var planets = await HttpClient.GetFromJsonAsync<Exoplanet[]>("jsons/exoplanets.json");
            _stars = await HttpClient.GetFromJsonAsync<Star[]>("jsons/stars.json");

            _mainJsModule = await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/scene.js");
            
            await SelectedExoplanetAsync(planets.FirstOrDefault(p => p.Id.ToString() == _id) ?? planets.ElementAt(9));
        }

        private async Task UICheckboxChangedAsync(ChangeEventArgs e)
        {
            _isUIChecked = (bool)e.Value;
            UiIVisibilityService.Notify(_isUIChecked);
            await _mainJsModule.InvokeVoidAsync("setIsFocusActivePlanetOnScene", !_isUIChecked);
        }

        private void OnDistanceChange(ChangeEventArgs args)
        {
            const double LYMiles = 5878625373184;
            var dtype = args.Value.ToString();
            switch (dtype)
            {
                case "light":
                    TravelTime = SpaceObject.Distance.HasValue ? Convert.ToInt32(SpaceObject.Distance * LYMiles / (186000d * 60 * 60 * 24 * 365)).ToString() + " years" : "unknown";
                    TravelSpeed = SpaceObject.Distance.HasValue ? "186,000 miles per second" : "unknown";
                    break;
                case "auto":
                    TravelTime = SpaceObject.Distance.HasValue ? Convert.ToInt32(SpaceObject.Distance * LYMiles / (80d * 60 * 24 * 365)).ToString() + " years" : "unknown";
                    TravelSpeed = "80 miles per hour";
                    break;
                case "train":
                    TravelTime = SpaceObject.Distance.HasValue ? Convert.ToInt32(SpaceObject.Distance * LYMiles / (186d * 60 * 24 * 365)).ToString() + " years" : "unknown";
                    TravelSpeed = "186 miles per hour";
                    break;
                case "jet":
                    TravelTime = SpaceObject.Distance.HasValue ? Convert.ToInt32(SpaceObject.Distance * LYMiles / (1300d * 60 * 24 * 365)).ToString() + " years" : "unknown";
                    TravelSpeed = "1,300 miles per hour";
                    break;
                case "voyager":
                    TravelTime = SpaceObject.Distance.HasValue ? Convert.ToInt32(SpaceObject.Distance * LYMiles / (34391d * 60 * 24 * 365)).ToString() + " years" : "unknown";
                    TravelSpeed = "34,391 miles per hour";
                    break;
                default:
                    TravelTime = "unknown";
                    TravelSpeed = "unknown";
                    break;
            }
        }

        private void HandleExoplanetsButtonClick()
        {
            _isExoplanetsTableVisible = true;
            StateHasChanged();
        }
        
        private async Task SelectedExoplanetAsync(Exoplanet exoplanet)
        {
            var star = _stars.First(x => x.Id == exoplanet.HostStarIds.First());

            var systemData = new ExoplanetSystemData
            {
                Planet = new ExoplanetSystemData.PlanetData
                {
                    Id = exoplanet.Id,
                    Name = exoplanet.Name,
                    OrbitalRadius = exoplanet.OrbitalRadius,
                    EarthRadius = exoplanet.EarthRadius ?? 1,
                    Texture = exoplanet.TexturePath,
                },
                Star = new ExoplanetSystemData.StarData
                {
                    Id = star.Id,
                    Name = star.Name,
                    SunRadius = star.SunRadius ?? 1,
                    Texture = star.TexturePath,
                }
            };

            _isExoplanetsTableVisible = false;
            StateHasChanged();
            
            if (await _mainJsModule.InvokeAsync<bool>("initHomeScene", "#scene-canvas", systemData))
            {
                return;
            }

            // In case of navigation
            await _mainJsModule.InvokeVoidAsync("showHomeStateAsync", systemData, false);
        }
    
        public void HandleObservatorySelectedEvent(Observatory observatory)
        {
            NavigationManager.NavigateTo($"{Paths.OBSERVATORIES_PATH}?id={observatory.Id}");
        }
    }
}