import { supabase } from './supabaseClient'

/**
 * Storage Interface
 * 
 * upload(file, path) -> { path, url, error }
 * delete(path) -> { error }
 * getUrl(path) -> string
 */

export class SupabaseStorageProvider {
    constructor(config) {
        this.bucket = config.bucket || 'images'
    }

    async upload(file, path) {
        const { data, error } = await supabase.storage
            .from(this.bucket)
            .upload(path, file)

        if (error) return { error }

        // Supabase returns 'path' relative to bucket
        const fullPath = data.path
        const { data: urlData } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(fullPath)

        return {
            path: fullPath,
            url: urlData.publicUrl
        }
    }

    async delete(path) {
        const { error } = await supabase.storage
            .from(this.bucket)
            .remove([path])

        return { error }
    }

    getUrl(path) {
        const { data } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(path)
        return data.publicUrl
    }
}

export class CloudinaryStorageProvider {
    constructor(config) {
        this.cloudName = config.cloudName?.trim()
        this.uploadPreset = config.uploadPreset?.trim()
        this.apiKey = config.apiKey?.trim()
        this.apiSecret = config.apiSecret?.trim()
        // Config validation
        if (!this.cloudName || !this.uploadPreset) {
            console.warn('Cloudinary Provider: Missing cloudName or uploadPreset')
        }
    }

    async upload(file, path) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', this.uploadPreset)
        // Cloudinary supports folders via public_id prefix or folder param
        // path example: sessions/123/filename.jpg
        // We can use the folder parameter
        const folder = path.substring(0, path.lastIndexOf('/'))
        const filename = path.substring(path.lastIndexOf('/') + 1).split('.')[0] // Remove extension as Cloudinary adds it or keeps original

        if (folder) formData.append('folder', folder)
        if (filename) formData.append('public_id', filename)

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (data.error) {
                return { error: new Error(data.error.message) }
            }

            return {
                path: data.public_id, // Store public_id as the "path"
                url: data.secure_url
            }
        } catch (e) {
            return { error: e }
        }
    }

    async delete(path) {
        // Client-side deletion requires signature generation if using the API directly
        // Or we can use the admin API if we have keys, but that's risky in client-side code.
        // However, the instructions mentioned adding/removing photos with buttons.
        // We will attempt to use the API Key/Secret if provided to generate a signature (mocked/simplified).

        if (!this.apiKey || !this.apiSecret) {
            return { error: new Error('Missing API Key or Secret. Cannot delete from Cloudinary.') }
        }

        // NOTE: This usually requires a backend to sign the request to protect the Secret.
        // Since this is a local-ish tool, we'll try to do a direct delete if possible or just warn.
        // Direct delete from client via API usually requires a timestamp and signature.

        const timestamp = Math.round((new Date()).getTime() / 1000)
        const signature = await this.generateSignature(`public_id=${path}&timestamp=${timestamp}${this.apiSecret}`)

        const formData = new FormData()
        formData.append('public_id', path)
        formData.append('api_key', this.apiKey)
        formData.append('timestamp', timestamp)
        formData.append('signature', signature)

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.result !== 'ok') {
                console.error('Cloudinary Destroy Error Response:', data)
                return { error: new Error(data.error?.message || `Cloudinary result: ${data.result}`) }
            }
            return {}
        } catch (e) {
            return { error: e }
        }
    }

    getUrl(path) {
        // Start with base base url
        // https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>
        // Note: This is a simple construction, might need more options for transforms
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/${path}`
    }

    // Simple SHA-1 for signature (using Web Crypto API)
    async generateSignature(str) {
        if (!crypto || !crypto.subtle) {
            throw new Error('Secure Context required (HTTPS or localhost) for Cloudinary signature generation.')
        }
        const msgBuffer = new TextEncoder().encode(str)
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        return hashHex
    }
}

export const createStorage = (type, config) => {
    if (type === 'cloudinary') {
        return new CloudinaryStorageProvider(config)
    }
    return new SupabaseStorageProvider(config)
}
