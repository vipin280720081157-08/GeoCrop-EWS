import React from "react";

export default function Skeleton({ h = 16, w = "100%" }: { h?: number | string; w?: number | string }) {
  return <div className="skeleton" style={{ height: h, width: w }} />;
}
