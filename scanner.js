import { ini } from "/ini.js";


//listen for intallation/update/Refresh
chrome.runtime.onInstalled.addListener((details) => {
  const currentVersion = chrome.runtime.getManifest().version;
  const previousVersion = details.previousVersion;
  const reason = details.reason;

  console.log(`Previous Version: ${previousVersion}`);
  console.log(`Current Version: ${currentVersion}`);

  // re-save the ini values after reinstall/refresh/update
  chrome.storage.local.set({ startValue: ini }, function () {
    console.log("Initial config data saved:", ini);
  });

  switch (reason) {
    case "install":
      console.log("New User installed the extension.");
      break;
    case "update":
      console.log("User has updated their extension.");
      break;
    case "chrome_update":
    case "shared_module_update":
    default:
      console.log("Other install events within the browser");
      break;
  }
});

//check if webnavigation includes the site you want to inject something into
chrome.webNavigation.onCompleted.addListener(
  (tab) => {
    console.log("triggered");
    //let url = document.getElementById("link").value;
    // let hostsuffix = url.match(/\.([a-z])\w+\.([a-z])\w+(\/)/g);
    // let pathprefix = url.match();
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab[0].id, allFrames: true },
        //this is where you put the script that needs to be injected in the site
        files: ["vervanger.js"],
      });
    });
  },
  {
    url: [
      {
        //this is where you put the site info
        hostSuffix: ".adlibhosting.com",
        pathPrefix: "/collections/",
      },
    ],
  }
);


//the amount of times you want to retry authenticating below
let retry = 3;

//Listen for authentication request
chrome.webRequest.onAuthRequired.addListener(
  function handler(details) {
    /*console.log("hai1")
    let data = ProvideCredentials()
    let startValue = data.startValue;
    console.log(startValue.Username)
    console.log("hai3")*/

    //username and password for webdav connection is hardcoded now. preferably pit this in ini. preferably also hash ini?
    let userName = "anonymous";
    let passWord = "";
    if (--retry < 0) return { cancel: true };
    return { authCredentials: { username: userName, password: passWord } };
    
    
  },
  //this is the url you get the authentication request from
  { urls: ["https://st-arsenaal.jhm.nl:5006/*"] },
  ["blocking"]
);


async function ProvideCredentials() {
  let data = await chrome.storage.local.get(["startValue"]);
  return data;
}

