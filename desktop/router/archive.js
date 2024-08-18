const Router = require('koa-router')

const ArchiveController = require('../controllers/Archive')

const router = Router({
  prefix: '/api/archive',
})

router.get('/:archiveId', ArchiveController.getSingleArchive)
router.patch('/', ArchiveController.patchArchiveByCustomerId)

module.exports = router
