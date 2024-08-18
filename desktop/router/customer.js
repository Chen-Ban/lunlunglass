const Router = require('koa-router')
const CustomerController = require('../controllers/Customer')

const router = Router({
  prefix: '/api/customer',
})

router.get('/:id', async (ctx, next) => {
  const id = ctx.params.id
  console.log(`User ID: ${id}`)
  ctx.body = `User ID: ${id}`
})

router.get('/', CustomerController.getCustomersByPagenation)

router.patch('/', CustomerController.createCustomer)

router.post('/', CustomerController.updateCustomer)

router.delete('/', CustomerController.deleteCustomer)

module.exports = router
