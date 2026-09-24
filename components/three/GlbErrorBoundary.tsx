"use client";

import { Component, ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Catches spine.glb load/parse failures (React error boundaries only work
 * as class components) and swaps in the procedural placeholder so the hero
 * never renders empty.
 */
export default class GlbErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("spine.glb failed to load, falling back to procedural spine:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
