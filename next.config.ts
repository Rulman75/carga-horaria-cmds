import type { NextConfig } from "next";
import { execSync } from "child_process";
import pkg from "./package.json";

function resolveSemVer(): { version: string; commit: string } {
  let version = pkg.version || "1.0.0";
  let commit = process.env.VERCEL_GIT_COMMIT_SHA
    ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
    : "";

  try {
    if (!commit) {
      commit = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
    }

    const latestTag = execSync("git describe --tags --abbrev=0", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    const cleanTag = latestTag.replace(/^v/i, "");
    const parts = cleanTag.split(".").map(Number);

    if (parts.length === 3 && !parts.some(isNaN)) {
      const countSinceTag = parseInt(
        execSync(`git rev-list ${latestTag}..HEAD --count`, {
          stdio: ["ignore", "pipe", "ignore"],
        })
          .toString()
          .trim(),
        10
      );

      // Si package.json tiene una versión mayor al tag, priorizar package.json;
      // si son iguales y hay commits posteriores al tag, incrementar el PATCH automáticamente.
      if (cleanTag === version && countSinceTag > 0) {
        version = `${parts[0]}.${parts[1]}.${parts[2] + countSinceTag}`;
      }
    }
  } catch {
    // Fallback limpio a package.json cuando no hay tags o entorno git completo
  }

  return { version, commit };
}

const { version, commit } = resolveSemVer();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_GIT_COMMIT: commit,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
