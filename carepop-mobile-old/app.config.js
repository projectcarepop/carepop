// app.config.js

// Generate a unique build number based on the current timestamp.
const buildNumber = String(Math.floor(Date.now() / 1000));

export default {
  "expo": {
    "name": "CarePop Mobile",
    "slug": "carepop",
    "version": "1.0.0",
    "owner": "projectcarepop",
    "orientation": "portrait",
    "icon": "./assets/carepop-logo-pink.png",
    "scheme": "carepop",
    "userInterfaceStyle": "light",
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#FFFFFF"
    },
    "ios": {
      "config": {
      "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      },
      "supportsTablet": true,
      "bundleIdentifier": "com.carepop.mobile",
      "buildNumber": buildNumber,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to find nearby clinics and provide you with accurate directions.",
        "ITSAppUsesNonExemptEncryption": false,
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.92849154218-ihqat9lglvl9c0nsv0qugds2io6rv4c2"
            ]
          }
        ]
      },
      "runtimeVersion": {
        "policy": "appVersion"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/carepop-logo-blue.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.carepop.mobile",
      "edgeToEdgeEnabled": true,
      "runtimeVersion": "1.0.0",
      "config": {
        "googleMaps": {
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    "web": {
      "favicon": "./assets/carepop-logo-blue.png"
    },
    "assetBundlePatterns": [
      "assets/*",
      "src/data/psgc/*"
    ],
    "plugins": [
      "expo-font",
      "expo-web-browser",
      "expo-router",
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": process.env.EXPO_SECRET_MAPBOX_API_KEY,
        }
      ]
    ],
    "extra": {
      "router": {},
      "eas": {
        "projectId": "38106ce3-1f9c-482e-8102-3f0db6130196"
      }
    }
  }
};