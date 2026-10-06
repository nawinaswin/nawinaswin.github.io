---
title: "Saxon"
date: 2026-10-05
draft: false
description: "Local-first macOS dictation with a native SwiftUI menu-bar app and a C++ Whisper inference daemon."
summary: "Local-first macOS dictation with a native SwiftUI menu-bar app, on-device Whisper transcription, and a C++ daemon."
image: "/images/projects/saxon-icon.png"
image_alt: "Saxon application icon"
tech: ["C++20", "SwiftUI", "whisper.cpp", "FFmpeg", "SQLite"]
---

Saxon is a local-first dictation app for macOS. It pairs a native SwiftUI menu-bar interface with a C++ daemon that handles audio capture, Whisper inference, and transcription history on the device.

## From the menu bar

The menu-bar app keeps everyday controls close at hand: recording, model status, a **Keep Model Warm** toggle, and recent transcriptions. Keeping the model loaded makes it ready for the next recording. Settings provide model management, microphone selection, and history controls.

## Under the hood

- **C++20 and whisper.cpp** power the local transcription daemon.
- **SwiftUI** provides the native macOS interface.
- **FFmpeg** handles audio capture, and **SQLite** stores transcription history.
- A **Unix domain socket** connects the app and daemon. A command-line client also supports recording and model controls.

## Source

[View Saxon on GitHub](https://github.com/nawinaswin/saxon) for source code, installation instructions, and architecture documentation.
