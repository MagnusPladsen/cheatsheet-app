import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { lc, APP_LIST } from "@cheatsheet/shared";

interface FolderPickerProps {
  folders: string[];
  onAddFolder: (path: string) => Promise<void>;
  onRemoveFolder: (path: string) => Promise<void>;
}

interface FolderInfo {
  path: string;
  detectedApps: string[];
}

export function FolderPicker({ folders, onAddFolder, onRemoveFolder }: FolderPickerProps) {
  const [folderInfos, setFolderInfos] = useState<FolderInfo[]>([]);

  useEffect(() => {
    async function detectAll() {
      const infos: FolderInfo[] = [];
      for (const folder of folders) {
        try {
          const detected = await invoke<boolean[]>("detect_apps", {
            basePath: folder,
            allFilePaths: APP_LIST.map((app) => app.filePaths),
          });

          const detectedApps = APP_LIST
            .filter((_, i) => detected[i])
            .map((app) => app.name);

          infos.push({ path: folder, detectedApps });
        } catch {
          infos.push({ path: folder, detectedApps: [] });
        }
      }
      setFolderInfos(infos);
    }
    detectAll();
  }, [folders]);

  const handleAddFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select config folder",
    });

    if (selected && typeof selected === "string") {
      if (!folders.includes(selected)) {
        await onAddFolder(selected);
      }
    }
  };

  return (
    <div className="border border-border rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-text-secondary tracking-wider">{lc("config folders")}</h3>
        <button
          onClick={handleAddFolder}
          className="px-2 py-1 text-xs border border-accent/30 text-accent hover:bg-accent-dim transition-colors tracking-wider"
        >
          {lc("+ add folder")}
        </button>
      </div>

      {folderInfos.length === 0 ? (
        <p className="text-xs text-text-muted">{lc("no folders configured")}</p>
      ) : (
        <div className="space-y-2">
          {folderInfos.map((info) => (
            <div
              key={info.path}
              className="flex items-center justify-between bg-bg-card border border-border rounded-sm px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-primary truncate font-mono">{info.path}</p>
                {info.detectedApps.length > 0 && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {lc("found:")} {info.detectedApps.map((a) => lc(a)).join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemoveFolder(info.path)}
                className="ml-2 text-xs text-text-muted hover:text-red-400 transition-colors shrink-0"
              >
                {lc("remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
