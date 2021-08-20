class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryObject = { ...this.queryString };
    const extractFields = ['sort', 'page', 'limit', 'fields'];
    extractFields.forEach((el) => delete queryObject[el]);
    queryObject = JSON.stringify(queryObject);
    queryObject = queryObject.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryObject));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortString = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortString);
    } else {
      this.query = this.query.sort('ratingsAverage');
    }
    return this;
  }
  limit() {
    if (this.queryString.fields) {
      const fieldsString = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsString);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
