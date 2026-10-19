import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// High quality H.264 for Instagram
Config.setCodec("h264");
Config.setCrf(18);
