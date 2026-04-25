import { nanoid } from "nanoid";
import { supabase } from "./supabaseClient";
import { validateImageFile } from "./validators";

export async function uploadBiomassImage(file: File, userId: string): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${nanoid(12)}.${extension}`;
  const { error } = await supabase.storage.from("biomass-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("biomass-images").getPublicUrl(path);
  return data.publicUrl;
}
