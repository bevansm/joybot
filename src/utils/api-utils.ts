import FormData from 'form-data';
export const mapToFormData = (data: { [key: string]: any }): FormData => {
  const formData = new FormData();
  Object.keys(data).forEach(k => formData.append(k, data[k]));
  return formData;
};
