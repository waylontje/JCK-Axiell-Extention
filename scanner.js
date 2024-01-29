import { ini } from "/ini.js";

chrome.runtime.onInstalled.addListener((details) => {
  const currentVersion = chrome.runtime.getManifest().version;
  const previousVersion = details.previousVersion;
  const reason = details.reason;

  console.log(`Previous Version: ${previousVersion}`);
  console.log(`Current Version: ${currentVersion}`);

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

chrome.webNavigation.onCompleted.addListener(
  (tab) => {
    console.log("triggered");
    //let url = document.getElementById("link").value;
    // let hostsuffix = url.match(/\.([a-z])\w+\.([a-z])\w+(\/)/g);
    // let pathprefix = url.match();
    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab[0].id, allFrames: true },
        files: ["vervanger.js"],
      });
    });
  },
  {
    url: [
      {
        hostSuffix: ".adlibhosting.com",
        pathPrefix: "/collections/",
      },
    ],
  }
);

let retry = 3;

chrome.webRequest.onAuthRequired.addListener(
  function handler(details) {
    /*console.log("hai1")
    let data = ProvideCredentials()
    let startValue = data.startValue;
    console.log(startValue.Username)
    console.log("hai3")*/
    let userName = "anonymous";
    let passWord = "";
    if (--retry < 0) return { cancel: true };
    return { authCredentials: { username: userName, password: passWord } };
    
    
  },
  { urls: ["https://st-arsenaal.jhm.nl:5006/*"] },
  ["blocking"]
);


async function ProvideCredentials() {
  let data = await chrome.storage.local.get(["startValue"]);
  return data;
}


/*
chrome.tabs.onUpdated.addListener(() => {
  let tab = getTab();
  if (tab.url.includes("https://jck-apw.adlibhosting.com/collections/?")) {
    insertScript();
    chrome.tabs.create({ url: "https://www.google.com/" });
  }
});
*/
