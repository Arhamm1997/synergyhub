import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

export class UploadService {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: config.aws.region,
            credentials: {
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey
            }
        });
    }

    /**
     * Generate a pre-signed URL for direct file upload to S3
     */
    async getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
            ContentType: contentType
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Upload a file to S3
     */
    async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType
        });

        await this.s3Client.send(command);
        return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    }

    /**
     * Delete a file from S3
     */
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: config.aws.bucketName,
            Key: key
        });

        await this.s3Client.send(command);
    }

    /**
     * Get a file's public URL
     */
    getPublicUrl(key: string): string {
        return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    }

    /**
     * Validate file type
     */
    validateFileType(contentType: string): boolean {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        return allowedTypes.includes(contentType);
    }
}