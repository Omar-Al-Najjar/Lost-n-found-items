drop policy if exists "post_images_select_own_folder" on storage.objects;
create policy "post_images_select_own_folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
