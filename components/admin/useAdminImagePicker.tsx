"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import {
  AdminImageEditor,
  type AdminImageEditorLabels,
} from "@/components/admin/AdminImageEditor";
import { adminUploadFile } from "@/lib/api-client";
import { toBrowserMediaUrl } from "@/lib/media-url";

export type AdminImagePickerLabels = Partial<AdminImageEditorLabels> & {
  edit?: string;
};

type UploadResult = {
  url: string;
  jpegUrl?: string;
  raw: Awaited<ReturnType<typeof adminUploadFile>>;
};

type Session = {
  src: string;
  fileName: string;
  projectId?: string;
  onUploaded: (result: UploadResult) => void | Promise<void>;
  /** Revoke blob URL when session ends (new file pick). */
  revokeSrc?: boolean;
};

/**
 * Shared admin image pick/edit flow: open cropper → upload → callback.
 * Mount `picker.ui` once in the component tree.
 */
export function useAdminImagePicker(
  labels?: AdminImagePickerLabels,
  onError?: (message: string) => void,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<{
    projectId?: string;
    onUploaded: (result: UploadResult) => void | Promise<void>;
    multiple?: boolean;
  } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);

  const closeSession = useCallback(() => {
    setSession((prev) => {
      if (prev?.revokeSrc && prev.src.startsWith("blob:")) {
        URL.revokeObjectURL(prev.src);
      }
      return null;
    });
    setBusy(false);
  }, []);

  const pickAndUpload = useCallback(
    (opts: {
      projectId?: string;
      multiple?: boolean;
      onUploaded: (result: UploadResult) => void | Promise<void>;
    }) => {
      pendingRef.current = opts;
      const input = inputRef.current;
      if (!input) return;
      input.multiple = Boolean(opts.multiple);
      input.value = "";
      input.click();
    },
    [],
  );

  const editExisting = useCallback(
    async (opts: {
      src: string;
      projectId?: string;
      fileName?: string;
      onUploaded: (result: UploadResult) => void | Promise<void>;
    }) => {
      let src = opts.src;
      let revokeSrc = false;
      try {
        const res = await fetch(toBrowserMediaUrl(opts.src) || opts.src, {
          mode: "cors",
          credentials: "omit",
        });
        if (res.ok) {
          const blob = await res.blob();
          if (blob.type.startsWith("image/") || blob.size > 0) {
            src = URL.createObjectURL(blob);
            revokeSrc = true;
          }
        }
      } catch {
        src = toBrowserMediaUrl(opts.src) || opts.src;
      }
      setSession({
        src,
        fileName: opts.fileName || "image.jpg",
        projectId: opts.projectId,
        onUploaded: opts.onUploaded,
        revokeSrc,
      });
    },
    [],
  );

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending || files.length === 0) {
      if (files.length === 0 && e.target.files?.length) {
        onError?.("Միայն նկար ֆայլ");
      }
      return;
    }

    const queue = files;
    const runNext = (index: number) => {
      const file = queue[index];
      if (!file) return;
      const blobUrl = URL.createObjectURL(file);
      setSession({
        src: blobUrl,
        fileName: file.name,
        projectId: pending.projectId,
        revokeSrc: true,
        onUploaded: async (result) => {
          await pending.onUploaded(result);
          if (index + 1 < queue.length) {
            runNext(index + 1);
          }
        },
      });
    };
    runNext(0);
  }, [onError]);

  const handleConfirm = useCallback(
    async (file: File) => {
      if (!session) return;
      setBusy(true);
      try {
        const raw = await adminUploadFile(file, session.projectId);
        const url = toBrowserMediaUrl(raw.jpegUrl || raw.url || "") || raw.jpegUrl || raw.url || "";
        const onUploaded = session.onUploaded;
        closeSession();
        await onUploaded({ url, jpegUrl: raw.jpegUrl, raw });
      } catch (err) {
        setBusy(false);
        throw err;
      }
    },
    [session, closeSession],
  );

  const ui = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      <AdminImageEditor
        open={Boolean(session)}
        imageSrc={session?.src ?? null}
        fileName={session?.fileName}
        labels={labels}
        onCancel={closeSession}
        onError={onError}
        onConfirm={(file) => handleConfirm(file)}
      />
    </>
  );

  return {
    ui,
    busy: busy || Boolean(session),
    pickAndUpload,
    editExisting,
  };
}
