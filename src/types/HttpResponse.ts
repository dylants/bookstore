export type HttpResponse<DataType, ErrorType extends Error> = {
  data: DataType;
  error?: ErrorType;
  status: number;
};
