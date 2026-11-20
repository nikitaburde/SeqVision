"use client";

import { Component, type ReactNode } from "react";

export default class WebGLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { unavailable: boolean }> {
  state = { unavailable: false };

  static getDerivedStateFromError() {
    return { unavailable: true };
  }

  render() {
    return this.state.unavailable ? this.props.fallback : this.props.children;
  }
}
