# LosslessCut 🎥 [![Build Status](https://travis-ci.org/PartyLich/lossless-cut.svg?branch=master)](https://travis-ci.org/PartyLich/lossless-cut)

Simple and fast cross platform tool for lossless trimming/cutting of video and audio files. 

Great for saving space by rough cutting your large video files taken from a video camera, GoPro, drone, etc. It lets you quickly extract the good parts from your videos and discard many gigabytes of data without doing a slow re-encode and thereby losing quality. It is extremely fast because it does an almost direct data copy. It is fueled by the awesome [**ffmpeg**](https://www.ffmpeg.org/) (included) for doing the grunt work. It also features some other lossless operations on videos.

![Demo](https://github.com/mifi/gifs/raw/master/2019-01-28-lossless-cut.gif)


## Features
- Lossless cutting of common video and audio formats
- Lossless re-merge of selected segments (for cutting out commercials etc.)
- Lossless merge of arbitrary files (with identical codecs)
- Lossless extracting of all data streams from a file (explode video, audio, subtitle and other streams of a file into separate files)
- Take full-resolution snapshots from videos in JPEG/PNG format
- Manual input range of cutpoints
- Can include primary streams (audio/video), or all streams
- Can remove audio track
- Apply a timecode offset
- Remux into different output format
- Change rotation/orientation metadata in videos. Great for rotating phone videos that come out the wrong way without actually re-encoding the video.

## Installing / running

- Download [latest LosslessCut from releases](https://github.com/PartyLich/lossless-cut/releases)
- Run LosslessCut app/exe
- On macOS, to open LosslessCut.app, Right Click > Open to bypass the security warning.

## Supported platforms
- macOS
- Windows (64/32bit)
- Linux (64, partially tested)

## Supported formats

Since LosslessCut is based on Chromium and uses the HTML5 video player, not all ffmpeg supported formats will be supported directly.
The following formats/codecs should generally work: MP4, MOV, WebM, MKV, OGG, WAV, MP3, AAC, H264, Theora, VP8, VP9.
For more information about supported formats / codecs, see https://www.chromium.org/audio-video.

Unsupported files can now be remuxed (fast) or encoded (slow) to a friendly format/codec from the `File` menu. A processed version of the file (without audio) will then be created and opened in the player. The cut operation will still be performed using the original file as input, so it will be lossless. This allows for potentially opening any file that ffmpeg is able to decode.


## Typical workflow
- Drag drop a video file into player to load or use <kbd>⌘</kbd>/<kbd>CTRL</kbd>+<kbd>O</kbd>.
- Press <kbd>SPACE</kbd> to play/pause or <kbd>◀</kbd><kbd>▶</kbd>, <kbd>,</kbd><kbd>.</kbd> to seek back/forth
- Select the cut start and end time. Press <kbd>I</kbd> to select the start time, <kbd>O</kbd> to select the end time for the cut. *Note that the portions you select will be PRESERVED and exported to a new file.*
- *(optional)* If you want to export more segments out of the video, press <kbd>+</kbd> or the `c+` button to add another segment, then select the next segment with <kbd>I</kbd>/<kbd>O</kbd>.
- *(optional)* If you want to re-merge all the selected segments after cutting, toggle the button `nm` (no merge) to `am` (auto merge). This is useful for *cutting away* certain parts of a video like advertisements (by selecting everything *except* the advertisements.)
- *(optional)* If you want to export to a certain dir, press the custom output dir button (default: input file dir)
- *(optional)* If you want to override orientation metadata, press the rotation button
- *(optional)* By default, all streams from input file will be exported to output. If you like to only export primary streams (1video&1audio) (pre-2.0 behaviour), toggle the button `all` to `ps`.
- Press the scissors button (or <kbd>E</kbd>) to export the slice(s)
- Press the camera button (or <kbd>C</kbd>) to take a JPEG/PNG snapshot from the current time
- If you want to move the original file to trash, press the trash button

Note: The original video files will not be modified. Instead it creates a lossless export in the same directory as the original file with from/to timestamps. Note that the cut is currently not precise around the cutpoints, so video before/after the nearest keyframe will be lost. EXIF data is preserved.

## Keyboard shortcuts
Press <kbd>h</kbd> To show/hide list of shortcuts

## Known issues & limitations
- **Cutting times are not accurate and will be "rounded" to the nearest keyframe.** In the future I plan on showing keyframes in the timeline, and eventually implement a "smart cut" feature that re-encodes only the part before the keyframe. See [#126](https://github.com/mifi/lossless-cut/issues/126)
- Your mileage may vary when it comes to `kc` *(keyframe cut)* vs `nc` *(normal cut)*. You may need to try both, depending on the video. GoPro 6/7 seems to require Normal Cut `nc`. See [#121](https://github.com/mifi/lossless-cut/issues/121). [ffmpeg](https://trac.ffmpeg.org/wiki/Seeking) also has documentation about these two seek/cut modes. `kc` means `-ss` *before* `-i` and `nc` means `-ss` *after* `-i`.
- `all` *(all streams)* seems to cause wrong length in GoPro footage. Use `ps` instead. See [#146](https://github.com/mifi/lossless-cut/issues/146) and [121](https://github.com/mifi/lossless-cut/issues/121#issuecomment-522196244)
- H265 is not yet supported natively. I have added a crude support with very low FPS preview. Alternatively convert to friendly codec (slow) from the menu, see [#88](https://github.com/mifi/lossless-cut/issues/88)
- Maybe counter-intuitively for some, cutting will remove the parts that of the video that are NOT selected. This is because in previous versions of LosslessCut there was no possibility to cut/merge multiple segments, but this was retrofitted later. Need to redesign the UI to make it more intuitive. See [#128](https://github.com/mifi/lossless-cut/issues/128)

## Troubleshooting

- **If you have an error when running the cut:** Try toggling the button `all` (all streams) to `ps` (primary streams). If that doesn't help, try to toggle `kc` *(keyframe cut)* to `nc` *(normal cut)*. See discussion in [#13](https://github.com/mifi/lossless-cut/pull/13).
- If you get an error when cutting or opening any kind of file under Windows, please check your anti-virus. It might be blocking execution of ffmpeg, see [#18](https://github.com/mifi/lossless-cut/issues/18)

## Development building / running

This app is built using [Electron](https://electronjs.org/). Make sure you have at least node v8 and (npm||yarn) installed. The app uses ffmpeg from PATH when developing.
```
git clone https://github.com/PartyLich/lossless-cut.git
cd lossless-cut
npm install
```

### Running
In one terminal:
```
npm run watch
```
In another:
```
npm start
```

## Contributing

Feel free to open issues, pull requests, or get in touch. 

Collaboration is one of the good things about FOSS, ....right? The fork was created because there was functionality I wanted to suit my tastes, and the tool was conveniently executed with technology I had either knowledge of or interest in. I'd __love__ to have my contributions included in the upstream version, but I'm not going to wait around for that to happen. Maybe by the time anyone reads this I'll already have something merged? 🤞

## Donate 🙈

The project will always remain free and open source, but if it's useful for you, consider supporting it. :) It will give us extra motivation to improve it. Or even better [donate to ffmpeg](https://www.ffmpeg.org/donations.html) because they are doing the world a big favor 🙏

Original author:  [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/mifino)

This fork: 

## Credits
- App icon made by [Dimi Kazak](http://www.flaticon.com/authors/dimi-kazak "Dimi Kazak") from [www.flaticon.com](http://www.flaticon.com "Flaticon") is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/ "Creative Commons BY 3.0")

---

Original made with ❤️ in 🇳🇴

This fork hecho en estados unidos 🇺🇸
