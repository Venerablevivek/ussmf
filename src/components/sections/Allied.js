"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/motion/Reveal";
import Eyebrow, { Tag } from "@/components/ui/Eyebrow";
import LogoSlot from "@/components/ui/LogoSlot";
import FallbackImage from "@/components/ui/FallbackImage";

function Segment({ id, d, color, duration, reduce }) {
  return (
    <>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="4 10"
        strokeLinecap="round"
        opacity=".6"
      >
        {reduce ? null : (
          <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="2s" repeatCount="indefinite" />
        )}
      </path>
      {reduce ? null : (
        <>
          <circle r="6" fill={color}>
            <animateMotion dur={`${duration}s`} repeatCount="indefinite">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
          <circle r="4" fill="#fff" stroke={color} strokeWidth="2">
            <animateMotion
              dur={`${duration}s`}
              begin="-1.6s"
              repeatCount="indefinite"
              keyPoints="1;0"
              keyTimes="0;1"
              calcMode="linear"
            >
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
        </>
      )}
    </>
  );
}

/** U.S.S.M.F. at the center of its allied network, with animated connection lines (desktop). */
export default function Allied() {
  const net = useRef(null);
  const hub = useRef(null);
  const left = useRef(null);
  const right = useRef(null);
  const reduce = useReducedMotion();
  const [lines, setLines] = useState(null);

  useEffect(() => {
    const draw = () => {
      if (window.innerWidth <= 900 || !net.current) {
        setLines(null);
        return;
      }
      const nr = net.current.getBoundingClientRect();
      const h = hub.current.getBoundingClientRect();
      const L = left.current.getBoundingClientRect();
      const R = right.current.getBoundingClientRect();
      const hx = h.left - nr.left + h.width / 2;
      const hy = h.top - nr.top + h.height / 2;
      const lx = L.right - nr.left - 10;
      const ly = L.top - nr.top + L.height / 2;
      const rx = R.left - nr.left + 10;
      const ry = R.top - nr.top + R.height / 2;
      setLines({
        w: nr.width,
        h: nr.height,
        a: `M${lx} ${ly} C${lx + 60} ${ly - 70} ${hx - 90} ${hy - 70} ${hx - h.width / 2 + 8} ${hy}`,
        b: `M${rx} ${ry} C${rx - 60} ${ry + 70} ${hx + 90} ${hy + 70} ${hx + h.width / 2 - 8} ${hy}`,
      });
    };
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(draw, 120);
    };
    draw();
    const late = setTimeout(draw, 1200);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(late);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="sec" id="allied">
      <div className="wrap">
        <Reveal className="sec-head center">
          <Eyebrow tone="blue">Global network</Eyebrow>
          <h2 className="h2">
            Allied federations &amp; <span className="grad">partners.</span>
          </h2>
          <p className="sub">
            U.S.S.M.F. sits at the center of a network of air sports organizations united in advancing athlete
            excellence.
          </p>
        </Reveal>
        <div className="net" id="net" ref={net}>
          <svg
            className="net-lines"
            aria-hidden="true"
            viewBox={lines ? `0 0 ${lines.w} ${lines.h}` : undefined}
          >
            {lines ? (
              <>
                <Segment id="netA" d={lines.a} color="#3B82F6" duration={3.2} reduce={reduce} />
                <Segment id="netB" d={lines.b} color="#FF7A6B" duration={3.6} reduce={reduce} />
              </>
            ) : null}
          </svg>
          <Reveal as="article" className="node clay t-blue" hover="lift" ref={left}>
            <span className="nlogo">
              WASF
              <FallbackImage
                src="/assets/wasflogo.png"
                alt="World Air Sports Federation logo"
                fill
                sizes="144px"
              />
            </span>
            <h3>World Air Sports Federation</h3>
            <p>
              W.A.S.F. oversees independent air sports disciplines globally. U.S.S.M.F. is allied with
              W.A.S.F. to deliver specialized sports medicine care to elite aerial athletes worldwide.
            </p>
            <Tag tone="blue" icon="globe" style={{ justifySelf: "start" }}>
              International air sports
            </Tag>
          </Reveal>
          <Reveal className="hub" ref={hub}>
            <LogoSlot size={104} />
            <b>U.S.S.M.F.</b>
            <span>Central hub · Sports Medicine Federation</span>
          </Reveal>
          <Reveal as="article" className="node clay t-coral" delay={0.08} hover="lift" ref={right}>
            <span className="nlogo">
              USASF
              <FallbackImage
                src="/assets/usasflogo.jpg"
                alt="United States Air Sports Federation logo"
                fill
                sizes="144px"
              />
            </span>
            <h3>United States Air Sports Federation</h3>
            <p>
              The national governing body for air sports in America. U.S.A.S.F. and U.S.S.M.F. are allied in
              delivering medical protection for American aerial athletes across all disciplines.
            </p>
            <Tag tone="coral" icon="wings" style={{ justifySelf: "start" }}>
              National air sports
            </Tag>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
