import { decode as decodeBase64 } from "base64-arraybuffer";

import { supabase } from "./supabase";

type UploadInput = {
  bucket: "photos" | "documents" | "reports";
  projectId: string;
  entityType: string;
  fileUri: string;
  fileName: string;
  contentType: string;
  base64?: string;
};

export async function uploadFile({
  bucket,
  projectId,
  entityType,
  fileUri,
  fileName,
  contentType,
  base64,
}: UploadInput): Promise<{ path: string }> {
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const path = `${projectId}/${entityType}/${safeName}`;

  let body: ArrayBuffer | Blob;
  if (base64) {
    body = decodeBase64(base64);
  } else {
    const res = await fetch(fileUri);
    body = await res.blob();
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType, upsert: false });
  if (error) throw error;
  return { path };
}

export async function getSignedUrl(
  bucket: "photos" | "documents" | "reports",
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
