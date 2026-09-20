import { apiClient } from '@/lib/api';
import { ApiResponse, Attachment } from '@/types/api';

export const attachmentsService = {
  /**
   * List attachments for a given entity (e.g. task)
   * GET /attachments?attachable_type=task&attachable_id={id}
   */
  async getAttachments(
    attachableType: string,
    attachableId: number
  ): Promise<ApiResponse<Attachment[]>> {
    const response = await apiClient.get<ApiResponse<Attachment[]>>(
      '/attachments',
      {
        params: {
          attachable_type: attachableType,
          attachable_id: attachableId,
        },
      }
    );
    return response.data;
  },

  /**
   * Upload an attachment for an entity
   * POST /attachments
   */
  async uploadAttachment(
    file: File,
    attachableType: string,
    attachableId: number
  ): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachable_type', attachableType);
    formData.append('attachable_id', String(attachableId));

    const response = await apiClient.post<ApiResponse<Attachment>>(
      '/attachments',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete an attachment
   * DELETE /attachments/{id}
   */
  async deleteAttachment(attachmentId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/attachments/${attachmentId}`
    );
    return response.data;
  },
};

export default attachmentsService;
