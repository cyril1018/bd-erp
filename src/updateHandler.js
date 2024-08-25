window.electronAPI.onUpdateAvailable(() => {
  const notification = document.getElementById("notification");
  notification.classList.remove("hidden");
  notification.innerText = "A new update is available. Downloading now...";
});

window.electronAPI.onUpdateDownloaded(() => {
  const userResponse = confirm(
    "A new update has been downloaded. Do you want to install it now?"
  );
  if (userResponse) {
    window.electronAPI.restartApp();
  } else {
    const notification = document.getElementById("notification");
    notification.classList.remove("hidden");
    notification.innerText =
      "Update downloaded. It will be installed on restart.";
  }
});
