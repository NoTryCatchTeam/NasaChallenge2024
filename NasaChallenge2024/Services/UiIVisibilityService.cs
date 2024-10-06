namespace NasaChallenge2024.Services;

public class UiIVisibilityService
{
    public event Action<bool> OnUiVisibilityUpdated;

    public void Notify(bool uiVisibility)
    {
        OnUiVisibilityUpdated?.Invoke(uiVisibility);
    }
}
