const { v4: uuid } = require('uuid')

const Customer = require('../database/models/Customer')
const ArchiveService = require('../services/Archive')

class CustomerService {
  /**
   * 新增用户，并新增档案
   * @param {Customer} customer
   */
  async createCustomer(customer) {
    const customerId = uuid()
    customer.customerId = customerId
    const archive = customer.lastArchive
    delete customer.lastArchive
    try {
      const newCustomer = new Customer(customer)
      await newCustomer.save()
      const archiveId = await ArchiveService.patchArchiveByCustomerId(
        customerId,
        archive,
      )
      archive.archiveId = archiveId
      archive.customerId = customerId
      customer.lastArchive = archive
    } catch (error) {
      console.log(error)
      throw Error('新增顾客失败')
    }
    return customer
  }
  async getCustomersByPagenation(pageNo, pageSize, isImportant, isDelete) {
    const query = {}
    if (isImportant != undefined) {
      query.isImportant = isImportant
    }
    if (isDelete != undefined) {
      query.isDelete = isDelete
    }
    return await Customer.find(query)
      .skip((pageNo - 1) * pageSize)
      .limit(pageSize)
      .sort({ 'lastArchive.timeStamp': 1 })
  }
  async getCustomerCount(isImportant, isDelete) {
    const query = {}
    if (isImportant != undefined) {
      query.isImportant = isImportant
    }
    if (isDelete != undefined) {
      query.isDelete = isDelete
    }
    return await Customer.find(query).countDocuments()
  }
  async getAllCustomer() {
    return await Customer.find({})
  }
  async getPurchaseCount(allCustomer) {
    let purchaseCount = 0
    for (const customer of allCustomer) {
      purchaseCount += customer.purchase
    }
    return purchaseCount
  }
  async getOptometryCount(allCustomer) {
    let optometryCount = 0
    for (const customer of allCustomer) {
      optometryCount += customer.optometry
    }
    return optometryCount
  }
  async updateCustomer(customers) {
    for (const customer of customers) {
      await Customer.findOneAndUpdate(
        { customerId: customer.customerId },
        customer,
      )
    }
  }
  async deleteCustomer(customerIds) {
    for (const customerId of customerIds) {
      await Customer.findOneAndDelete({ customerId })
    }
  }
}

module.exports = new CustomerService()
