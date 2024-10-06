using System.Net.Http.Json;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using NasaChallenge2024.Definitions.Models;
using NasaChallenge2024.Layout;

namespace NasaChallenge2024.Pages
{
    public partial class Home : ComponentBase
    {
        [Inject]
        IJSRuntime JsRuntime { get; set; }
        [Inject]
        HttpClient HttpClient { get; set; }
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

        public User User { get; set; } = new User
        {
            Name = "MISTER NITRO",
            Completion = 30,
            UserScore = 658
        };

        public string TravelSpeed { get; set; }
        public string TravelTime { get; set; }


        [Parameter]
        public bool IsUIChecked { get; set; } = true;
        private bool isUIChecked;
        private string UIVisibility;
        private bool _isExoplanetTableVisible;
        private bool _isObservatoryWindowVisible;
        private bool _isTelescopeFloatingWindowVisible;

        private ObservatoryWindow _observatoryWindowRef;
        private TelescopeFloatingWindow _telescopeFloatingWindowRef;

        protected override void OnParametersSet()
        {
            isUIChecked = this.IsUIChecked;
            OnDistanceChange(new ChangeEventArgs() { Value = "light" });
        }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {

            if (!firstRender)
            {
                return;
            }


            var planets = await HttpClient.GetFromJsonAsync<Exoplanet[]>("jsons/exoplanets.json");
            var stars = await HttpClient.GetFromJsonAsync<Star[]>("jsons/stars.json");

            var planetData = planets.ElementAt(9);
            var star = stars.First(x => x.Id == planetData.HostStarIds.First());

            var systemData = new ExoplanetSystemData
            {
                Planet = new ExoplanetSystemData.PlanetData
                {
                    Id = planetData.Id,
                    Name = planetData.Name,
                    OrbitalRadius = planetData.OrbitalRadius,
                    EarthRadius = planetData.EarthRadius ?? 1,
                    Texture = planetData.TexturePath,
                },
                Star = new ExoplanetSystemData.StarData
                {
                    Id = star.Id,
                    Name = star.Name,
                    SunRadius = star.SunRadius ?? 1,
                    Texture = star.TexturePath,
                }
            };

            _mainJsModule = await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/scene.js");
            await _mainJsModule.InvokeVoidAsync("initScene", "#scene-canvas", systemData);

        }

        private async Task UICheckboxChangedAsync(ChangeEventArgs e)
        {
            var value = e.Value;
            this.UIVisibility = (bool)value == false ? "invisible" : string.Empty;

            await _mainJsModule.InvokeVoidAsync("setIsFocusOnScene", !(bool)value);
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
            _isExoplanetTableVisible = true;
            StateHasChanged();
        }

        private void HandleExoplanetSelectedEvent(Exoplanet exoplanet)
        {
            _isExoplanetTableVisible = false;
            StateHasChanged();
        }

        public void HandleObservatorySelectedEvent(Observatory observatory)
        {
            _isExoplanetTableVisible = false;
            _isObservatoryWindowVisible = true;
            _observatoryWindowRef.SelectObservatory(observatory);
            StateHasChanged();
        }

        public void HandleTelescopeSelectedEvent(Telescope telescope)
        {
            _isExoplanetTableVisible = false;
            _isTelescopeFloatingWindowVisible = true;
            _telescopeFloatingWindowRef.SelectObservatory(telescope);
            StateHasChanged();
        }

        private void HandleObservatoryWindowCloseClickedEvent()
        {
            _isObservatoryWindowVisible = false;
            StateHasChanged();
        }

        private void HandleTelescopeWindowCloseClickedEvent()
        {
            _isTelescopeFloatingWindowVisible = false;
            StateHasChanged();
        }
    }
}