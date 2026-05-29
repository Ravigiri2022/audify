-- Storage bucket for audio files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audify-files',
  'audify-files',
  false,
  524288000,  -- 500 MB hard limit
  array[
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
    'audio/flac', 'audio/ogg', 'audio/aac', 'audio/mp4',
    'audio/m4a', 'audio/opus', 'audio/webm',
    'video/mp4', 'video/webm'
  ]
)
on conflict (id) do nothing;

-- RLS: users can only access their own files
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (
    bucket_id = 'audify-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own files"
  on storage.objects for select
  using (
    bucket_id = 'audify-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'audify-files' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
