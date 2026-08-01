import { create } from "zustand";
import { DEVICE_PRESETS, CONFIG } from "@/lib/constants";
import { clamp } from "@/lib/utils";

interface ViewportState {
  selectedDeviceId: string;
  width: number;
  height: number;
  customWidth: number;
  customHeight: number;
  zoom: number;
  sx: number;
  sy: number;
  cropKey: string;
  isCustom: boolean;
  bgTitle: string;
  bgFilename: string;
  isCustomBg: boolean;
  bgObjectUrl: string | null;
  bgImgElement: HTMLImageElement | null;
  defaultBgElement: HTMLImageElement | null;
  isLoading: boolean;

  setDevice: (deviceId: string) => void;
  setCustomDimensions: (w: number, h: number) => void;
  setZoom: (zoom: number) => void;
  setCropOffset: (sx: number, sy: number) => void;
  setCropKey: (key: string) => void;
  setCustomBackground: (file: File) => void;
  resetToDefaultBackground: () => void;
  setDefaultBgElement: (img: HTMLImageElement | null) => void;
  setIsLoading: (loading: boolean) => void;
  recenter: () => void;
}

export const useViewportStore = create<ViewportState>((set, get) => ({
  selectedDeviceId: DEVICE_PRESETS[0].id,
  width: DEVICE_PRESETS[0].width,
  height: DEVICE_PRESETS[0].height,
  customWidth: 1290,
  customHeight: 2796,
  zoom: 1,
  sx: 0,
  sy: 0,
  cropKey: "",
  isCustom: false,
  bgTitle: "Default",
  bgFilename: CONFIG.defaultBgSrc,
  isCustomBg: false,
  bgObjectUrl: null,
  bgImgElement: null,
  defaultBgElement: null,
  isLoading: false,

  setDevice: (deviceId: string) => {
    if (deviceId === "custom") {
      const { customWidth, customHeight } = get();
      set({
        selectedDeviceId: "custom",
        isCustom: true,
        width: customWidth,
        height: customHeight,
      });
    } else {
      const preset = DEVICE_PRESETS.find((p) => p.id === deviceId) || DEVICE_PRESETS[0];
      set({
        selectedDeviceId: preset.id,
        isCustom: false,
        width: preset.width,
        height: preset.height,
      });
    }
    get().recenter();
  },

  setCustomDimensions: (w: number, h: number) => {
    const validW = clamp(w, CONFIG.customSize.min, CONFIG.customSize.max);
    const validH = clamp(h, CONFIG.customSize.min, CONFIG.customSize.max);
    set({
      customWidth: validW,
      customHeight: validH,
      width: validW,
      height: validH,
    });
    get().recenter();
  },

  setZoom: (zoom: number) => {
    set({ zoom: clamp(zoom, CONFIG.zoom.min, CONFIG.zoom.max) });
  },

  setCropOffset: (sx: number, sy: number) => {
    set({ sx, sy });
  },

  setCropKey: (cropKey: string) => {
    set({ cropKey });
  },

  setCustomBackground: (file: File) => {
    const { bgObjectUrl: prevUrl } = get();
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }
    const newUrl = URL.createObjectURL(file);

    set({ isLoading: true });

    const img = new Image();
    img.onload = () => {
      set({
        bgImgElement: img,
        bgObjectUrl: newUrl,
        isCustomBg: true,
        bgTitle: "Selected",
        bgFilename: file.name,
        cropKey: "",
        isLoading: false,
      });
      get().recenter();
    };
    img.onerror = () => {
      set({ isLoading: false });
    };
    img.src = newUrl;
  },

  resetToDefaultBackground: () => {
    const { bgObjectUrl } = get();
    if (bgObjectUrl) {
      URL.revokeObjectURL(bgObjectUrl);
    }
    set({
      bgImgElement: null,
      bgObjectUrl: null,
      isCustomBg: false,
      bgTitle: "Default",
      bgFilename: CONFIG.defaultBgSrc,
      cropKey: "",
    });
    get().recenter();
  },

  setDefaultBgElement: (img: HTMLImageElement | null) => {
    set({ defaultBgElement: img });
    get().recenter();
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  recenter: () => {
    const { bgImgElement, defaultBgElement, width, height } = get();
    const activeImg = bgImgElement || defaultBgElement;
    if (!activeImg) {
      set({ zoom: 1, sx: 0, sy: 0, cropKey: "" });
      return;
    }
    const iw = activeImg.naturalWidth;
    const ih = activeImg.naturalHeight;
    const base = Math.max(width / iw, height / ih);
    const scale = base * 1;
    const sw = width / scale;
    const sh = height / scale;
    const sxMax = Math.max(0, iw - sw);
    const syMax = Math.max(0, ih - sh);

    set({
      zoom: 1,
      sx: sxMax / 2,
      sy: syMax / 2,
      cropKey: `${activeImg.src || "mem"}::${iw}x${ih}`,
    });
  },
}));
