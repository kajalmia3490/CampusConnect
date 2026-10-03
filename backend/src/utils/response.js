const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    status: 'fail',
    message,
  });
};

const paginatedResponse = (res, data, pagination, message = 'Success') => {
  res.status(200).json({
    status: 'success',
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / (pagination.limit || 10)),
      hasNext: pagination.page * pagination.limit < pagination.total,
      hasPrev: pagination.page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
