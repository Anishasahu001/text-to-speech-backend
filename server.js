const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5000;


// ==========================================
// LANGUAGES
// ==========================================

const languages = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "Hindi" },
  { code: "gu-IN", name: "Gujarati" },
  { code: "mr-IN", name: "Marathi" },
  { code: "bn-IN", name: "Bengali" },
  { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" },
  { code: "kn-IN", name: "Kannada" },
  { code: "ml-IN", name: "Malayalam" },
  { code: "pa-IN", name: "Punjabi" },
  { code: "od-IN", name: "Odia" }
];


// ==========================================
// VOICES
// ==========================================

const voices = [
  {
    name: "English Female",
    language: "en-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "English Male",
    language: "en-IN",
    gender: "Male",
    providerVoice: "shubh"
  },
  {
    name: "Hindi Female",
    language: "hi-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Hindi Male",
    language: "hi-IN",
    gender: "Male",
    providerVoice: "shubh"
  },
  {
    name: "Gujarati Female",
    language: "gu-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Gujarati Male",
    language: "gu-IN",
    gender: "Male",
    providerVoice: "shubh"
  },
  {
    name: "Marathi Female",
    language: "mr-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Marathi Male",
    language: "mr-IN",
    gender: "Male",
    providerVoice: "shubh"
  },
  {
    name: "Bengali Female",
    language: "bn-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Tamil Female",
    language: "ta-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Telugu Female",
    language: "te-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Kannada Female",
    language: "kn-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Malayalam Female",
    language: "ml-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Punjabi Female",
    language: "pa-IN",
    gender: "Female",
    providerVoice: "ritu"
  },
  {
    name: "Odia Female",
    language: "od-IN",
    gender: "Female",
    providerVoice: "ritu"
  }
];


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Text-to-Speech Backend is running"
  });
});


// ==========================================
// HEALTH
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TTS Backend is running"
  });
});


// ==========================================
// LANGUAGES API
// ==========================================

app.get("/api/languages", (req, res) => {
  res.json({
    success: true,
    languages
  });
});


// ==========================================
// VOICES API
// ==========================================

app.get("/api/voices", (req, res) => {
  res.json({
    success: true,
    voices
  });
});


// ==========================================
// TEXT TO SPEECH
// ==========================================

app.post("/api/tts", async (req, res) => {

  try {

    const { text, language, voice } = req.body;

    console.log("");
    console.log("==============================");
    console.log("TTS REQUEST");
    console.log("==============================");
    console.log("Text:", text);
    console.log("Language:", language);
    console.log("Voice:", voice);

    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required."
      });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Text cannot exceed 500 characters."
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required."
      });
    }

    if (!voice) {
      return res.status(400).json({
        success: false,
        message: "Voice is required."
      });
    }


    // --------------------------------------
    // FIND VOICE
    // --------------------------------------

    const selectedVoice = voices.find(
      (item) =>
        item.name === voice &&
        item.language === language
    );

    if (!selectedVoice) {
      return res.status(400).json({
        success: false,
        message: "Invalid voice for selected language."
      });
    }

    console.log(
      "Sarvam voice:",
      selectedVoice.providerVoice
    );


    // --------------------------------------
    // CHECK API KEY
    // --------------------------------------

    if (
      !process.env.SARVAM_API_KEY ||
      process.env.SARVAM_API_KEY === "YOUR_ACTUAL_SARVAM_KEY"
    ) {
      return res.status(500).json({
        success: false,
        message: "Sarvam API key is missing."
      });
    }


    // --------------------------------------
    // SARVAM REQUEST
    // --------------------------------------

    const sarvamRequest = {

      text: text.trim(),

      language_code: language,

      speaker: selectedVoice.providerVoice,

      model: "bulbul:v3",

      pace: 1,

      speech_sample_rate: 22050,

      output_audio_codec: "wav"

    };


    console.log("Sending request to Sarvam...");


    const sarvamResponse = await axios.post(
      "https://api.sarvam.ai/text-to-speech",

      sarvamRequest,

      {
        headers: {
          "api-subscription-key":
            process.env.SARVAM_API_KEY,

          "Content-Type":
            "application/json"
        },

        timeout: 60000
      }
    );


    console.log("Sarvam response received.");

    console.log(
      "Response keys:",
      Object.keys(sarvamResponse.data)
    );


    // --------------------------------------
    // GET BASE64 AUDIO
    // --------------------------------------

    const audioBase64 =
      sarvamResponse.data?.audios?.[0];


    console.log(
      "Audio exists:",
      !!audioBase64
    );

    console.log(
      "Audio length:",
      audioBase64 ? audioBase64.length : 0
    );


    if (!audioBase64) {

      return res.status(500).json({
        success: false,
        message: "Sarvam did not return audio."
      });

    }


    // --------------------------------------
    // CONVERT BASE64 TO BUFFER
    // --------------------------------------

    const audioBuffer =
      Buffer.from(
        audioBase64,
        "base64"
      );


    console.log(
      "Audio buffer size:",
      audioBuffer.length
    );


    // --------------------------------------
    // CHECK WAV HEADER
    // --------------------------------------

    const header =
      audioBuffer
        .subarray(0, 12)
        .toString("ascii");

    console.log(
      "Audio header:",
      header
    );


    // --------------------------------------
    // RETURN REAL AUDIO FILE
    // --------------------------------------

    res.set({

      "Content-Type":
        "audio/wav",

      "Content-Length":
        audioBuffer.length,

      "Content-Disposition":
        'inline; filename="speech.wav"',

      "Cache-Control":
        "no-cache"

    });


    res.send(audioBuffer);


  } catch (error) {

    console.error("");
    console.error("==============================");
    console.error("TTS ERROR");
    console.error("==============================");

    console.error(
      error.response?.data ||
      error.message
    );


    res.status(
      error.response?.status || 500
    ).json({

      success: false,

      message:
        error.response?.data?.message ||
        "Failed to generate speech."

    });

  }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});