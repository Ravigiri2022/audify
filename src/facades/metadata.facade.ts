import * as mm from 'music-metadata-browser'
import type { AudioMetadata } from '@/types/tool.types'

class MetadataFacade {
  async read(file: File): Promise<AudioMetadata> {
    try {
      const result = await mm.parseBlob(file, { skipCovers: true })

      const { format, common } = result

      return {
        format: format.container ?? 'unknown',
        codec: format.codec ?? 'unknown',
        duration: format.duration ?? 0,
        bitrate: format.bitrate ? Math.round(format.bitrate / 1000) : 0,
        sampleRate: format.sampleRate ?? 0,
        channels: format.numberOfChannels ?? 0,
        fileSize: file.size,
        title: common.title,
        artist: common.artist,
        album: common.album,
        year: common.year,
        genre: common.genre?.[0],
      }
    } catch (err) {
      throw new Error(
        `Metadata read failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }
}

export const metadataFacade = new MetadataFacade()
