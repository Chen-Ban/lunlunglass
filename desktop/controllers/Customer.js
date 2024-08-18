const CustomerService = require('../services/Customer')

class CustomerController {
  async createCustomer(ctx) {
    const customer = ctx.request.body.customer

    const newCustomer = await CustomerService.createCustomer(customer)
    ctx.status = 200
    ctx.body = {
      errno: 0,
      data: {
        patchNum: 1,
        customer: newCustomer,
      },
    }
  }
  async getCustomersByPagenation(ctx) {
    const { searchParams } = new URL(ctx.request.url, `http://${ctx.host}`)
    const pageNo = parseInt(searchParams.get('pageNo'))
    const pageSize = parseInt(searchParams.get('pageSize'))
    const isImportant = searchParams.get('isImportant')
    const isDelete = searchParams.get('isDelete')
    const PageinationCustomers = await CustomerService.getCustomersByPagenation(
      pageNo,
      pageSize,
      isImportant,
      isDelete,
    )
    const totalSize = await CustomerService.getCustomerCount(
      isImportant,
      isDelete,
    )
    ctx.status = 200
    ctx.body = {
      errno: 0,
      data: {
        pageNo,
        pageSize,
        totalSize,
        PageinationCustomers,
      },
    }
  }
  async updateCustomer(ctx) {
    const customer = ctx.request.body.customer
    await CustomerService.updateCustomer(customer)
    ctx.status = 201
    ctx.body = {
      errno: 0,
      data: {
        updateNum: customer.length,
      },
    }
  }
  async deleteCustomer(ctx) {
    // const { searchParams } = new URL(ctx.request.url, `http://${ctx.host}`)
    // const customerId = searchParams.getAll('customerId')
    const customerIds = ctx.request.body.customerIds
    console.log(customerIds)
    await CustomerService.deleteCustomer(customerIds)
    ctx.status = 200

    ctx.body = {
      errno: 0,
      data: {
        deleteNum: customerIds.length,
      },
    }
  }
}

module.exports = new CustomerController()
