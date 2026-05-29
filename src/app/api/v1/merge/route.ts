import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { randomBytes } from 'crypto'

ffmpeg.setFfmpegPath(ffmpegStatic as string)

const DEFAULT_CROSSFADE = 0

export async function POST(request: NextRequest) {
  // 1. Validate API key
  const ctx = await validateApiKey(request)
  if (isErrorResponse(ctx)) return ctx

  // 2. Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Failed to parse multipart form data' }, { status: 400 })
  }

  // Collect files named file_0, file_1, file_2, ...
  const files: File[] = []
  let i = 0
  while (true) {
    const entry = formData.get(`file_${i}`)
    if (!entry || !(entry instanceof File)) break
    files.push(entry)
    i++
  }

  if (files.length < 2) {
    return Response.json(
      { error: 'At least 2 files are required: file_0, file_1, ...' },
      { status: 400 }
    )
  }

  const crossfadeRaw = formData.get('crossfade') as string | null
  const crossfade = crossfadeRaw !== null && crossfadeRaw !== ''
    ? Number(crossfadeRaw)
    : DEFAULT_CROSSFADE

  if (!Number.isFinite(crossfade) || crossfade < 0) {
    return Response.json(
      { error: 'Field "crossfade" must be a non-negative number (seconds)' },
      { status: 400 }
    )
  }

  // Determine output format from the first file
  const firstExt = files[0].name.includes('.')
    ? files[0].name.split('.').pop()!.toLowerCase()
    : 'mp3'

  const id = randomBytes(8).toString('hex')
  const tmpDir = os.tmpdir()
  const tempPaths: string[] = []
  const outputPath = path.join(tmpDir, `wavlovesme_merge_out_${id}.${firstExt}`)

  try {
    // Write all input files to temp disk
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx]
      const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'
      const tmpPath = path.join(tmpDir, `wavlovesme_merge_in_${id}_${idx}.${ext}`)
      const buf = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(tmpPath, buf)
      tempPaths.push(tmpPath)
    }

    // Build and run ffmpeg merge
    await runMerge(tempPaths, outputPath, firstExt, crossfade)

    const outputBuffer = await fs.readFile(outputPath)

    return new Response(outputBuffer, {
      headers: {
        'Content-Type': `audio/${firstExt}`,
        'Content-Disposition': `attachment; filename="merged.${firstExt}"`,
        'Content-Length': String(outputBuffer.byteLength),
        'X-Files-Merged': String(files.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FFmpeg merge failed'
    return Response.json({ error: message }, { status: 422 })
  } finally {
    // Clean up all temp files
    for (const p of tempPaths) {
      await fs.unlink(p).catch(() => {})
    }
    await fs.unlink(outputPath).catch(() => {})
  }
}

function runMerge(
  inputPaths: string[],
  outputPath: string,
  outputExt: string,
  crossfade: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (crossfade > 0) {
      // Build an acrossfade filter chain for N files:
      // Each pair is joined with acrossfade, with the output of each step feeding the next.
      // For 2 files: [0:a][1:a]acrossfade=d=2:c1=tri:c2=tri[out]
      // For 3 files: [0:a][1:a]acrossfade=d=2:c1=tri:c2=tri[a01]; [a01][2:a]acrossfade=d=2:c1=tri:c2=tri[out]
      const filterParts: string[] = []
      let lastLabel = '[0:a]'

      for (let i = 1; i < inputPaths.length; i++) {
        const outLabel = i === inputPaths.length - 1 ? '[out]' : `[a${i}]`
        filterParts.push(
          `${lastLabel}[${i}:a]acrossfade=d=${crossfade}:c1=tri:c2=tri${outLabel}`
        )
        lastLabel = `[a${i}]`
      }

      const filterComplex = filterParts.join('; ')

      let cmd = ffmpeg()
      for (const p of inputPaths) {
        cmd = cmd.input(p)
      }

      cmd
        .complexFilter(filterComplex)
        .map('[out]')
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run()
    } else {
      // Simple concat using the concat demuxer via filter_complex
      // [0:a][1:a]...[N:a]concat=n=N:v=0:a=1[out]
      const inputLabels = inputPaths.map((_, idx) => `[${idx}:a]`).join('')
      const filterComplex = `${inputLabels}concat=n=${inputPaths.length}:v=0:a=1[out]`

      let cmd = ffmpeg()
      for (const p of inputPaths) {
        cmd = cmd.input(p)
      }

      cmd
        .complexFilter(filterComplex)
        .map('[out]')
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run()
    }
  })
}
