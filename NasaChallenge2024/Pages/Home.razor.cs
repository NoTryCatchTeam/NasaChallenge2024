using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using NasaChallenge2024.Definitions.Models;

namespace NasaChallenge2024.Pages
{
    public partial class Home : ComponentBase
    {
        [Inject]
        IJSRuntime JsRuntime { get; set; }
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

        [Parameter]
        public bool IsUIChecked { get; set; } = true;
        private bool isUIChecked;
        private string UIVisibility;
        protected override void OnParametersSet()
        {
            isUIChecked = this.IsUIChecked;
        }
        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (!firstRender)
            {
                return;
            }

            _mainJsModule = await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./js/main.js");
            await _mainJsModule.InvokeVoidAsync("hello");
        }

        private void UICheckboxChanged(ChangeEventArgs e)
        {
            var value = e.Value;
            this.UIVisibility = (bool)value == false ? "invisible" : string.Empty;
        }
    }
}