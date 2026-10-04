"use client";

import dynamic from "next/dynamic";

const NutBowlScene = dynamic(() => import("./nut-bowl-scene"), {
  ssr: false,
  loading: () => null,
});

export default function HeroScene() {
  return <NutBowlScene />;
}