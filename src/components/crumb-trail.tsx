"use client";

import { motion, useReducedMotion } from "motion/react";

const crumbs = [
  { size: 7, y: 11, rotation: -15 },
  { size: 10, y: -5, rotation: 24 },
  { size: 6, y: 6, rotation: 44 },
  { size: 12, y: -11, rotation: -28 },
  { size: 8, y: 8, rotation: 18 },
  { size: 5, y: -7, rotation: -42 },
  { size: 9, y: 3, rotation: 32 },
  { size: 6, y: -13, rotation: 12 },
  { size: 11, y: 6, rotation: -19 },
  { size: 7, y: -4, rotation: 48 },
  { size: 5, y: 12, rotation: -33 },
  { size: 9, y: -9, rotation: 27 },
];

export default function CrumbTrail() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="crumb-trail relative mx-auto flex h-14 max-w-7xl items-center justify-center overflow-hidden px-5" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-px w-[min(68%,680px)] -translate-x-1/2 -translate-y-1/2 border-t border-dashed border-[#b98752]/30" />
      <div className="relative flex w-[min(68%,680px)] items-center justify-between">
        {crumbs.map((crumb, index) => (
          <motion.span
            key={index}
            className="crumb-piece block rounded-[42%_58%_61%_39%] bg-[#b98752] shadow-[0_1px_1px_rgba(85,53,26,0.14)]"
            style={{ width: crumb.size, height: crumb.size * 0.72 }}
            initial={reduceMotion ? false : { opacity: 0, y: crumb.y - 10, rotate: crumb.rotation - 30, scale: 0.5 }}
            whileInView={{ opacity: 1, y: crumb.y, rotate: crumb.rotation, scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : index * 0.045, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  );
}