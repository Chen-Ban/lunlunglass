const { v4: uuidv4, v1: uuidv1 } = require('uuid')
const { Random, mock } = require('mockjs')

const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
  encoding: 'utf8',
  debug: false,
})

require('./database/connection')

const Customer = require('./database/models/Customer')
const Statics = require('./database/models/Statics')
const { ArchiveModel } = require('./database/models/Archive')
const TemplateModel = require('./database/models/Template')

const CustomerService = require('./services/Customer')
const ArchiveService = require('./services/Archive')
const TemplateService = require('./services/Template')
const { log } = require('node:console')

const initCustomer = async () => {
  await Customer.deleteMany({})
  await ArchiveModel.deleteMany({})
  console.log('删除成功')
  let i = 1000
  while (i--) {
    const archivesLength = Random.integer(1, 10)
    const archives = Array.from({ length: archivesLength }, (_, i) => ({
      sight: {
        left: {
          nearsighted: Random.integer(0, 30) * 50,
          astigmatism: Random.integer(0, 30) * 50,
          pupilDistance: Random.integer(30, 50),
        },
        right: {
          nearsighted: Random.integer(0, 30) * 50,
          astigmatism: Random.integer(0, 30) * 50,
          pupilDistance: Random.integer(30, 50),
        },
      },
      prescription: {
        left: {
          spherical: Random.integer(30, 50),
          adjustSight: Random.integer(0, 10) / 5,
          cylinder: Random.integer(30, 50),
          axial: Random.integer(30, 50),
        },
        right: {
          spherical: Random.integer(30, 50),
          adjustSight: Random.integer(0, 10) / 5,
          cylinder: Random.integer(30, 50),
          axial: Random.integer(30, 50),
        },
      },
      timeStamp: Random.date('T'),
    }))
    const lastArchive = archives.pop()
    const optometry = archivesLength
    const purchase = Math.floor(optometry * (Math.random() * 0.5 + 0.5))
    const customer = {
      name: Random.cname(),
      age: Random.integer(3, 150),
      imgSrc: Random.image('300'),
      gender: Random.integer(-1, 1),
      isImportant: Random.boolean(),
      isDelete: Random.boolean(),
      phone: mock(/^1[3-9]\d{9}$/),
      optometry,
      purchase,
      lastArchive,
      archives: [],
    }
    const { customerId } = await CustomerService.createCustomer(customer)
    console.log('新增用户成功', customerId)
    for (let archive of archives) {
      const archiveId = await ArchiveService.patchArchiveByCustomerId(
        customerId,
        archive,
      )
      // console.log('新增档案成功', archiveId)
    }
  }
}
const computeStatics = async () => {
  await Statics.deleteMany({})
  console.log('删除成功')
  const customerCount = await CustomerService.getCustomerCount()
  const allCustomer = await CustomerService.getAllCustomer()
  const purchaseCount = await CustomerService.getPurchaseCount(allCustomer)
  const optometryCount = await CustomerService.getOptometryCount(allCustomer)

  const newStatics = new Statics({
    customerCount,
    purchaseCount,
    optometryCount,
  })
  await newStatics.save()
}

const initTemplate = async () => {
  await TemplateModel.deleteMany({})
  const cusTemNum = 1 // Random.integer(1, 5)
  const opTemNum = 1 // Random.integer(1, 5)
  cusTemProp2TypeMap = {
    title: 'text',
    printId: 'text',
    timeStamp: 'text',
    outlets: 'text',
    saleman: 'text',
    customerName: 'text',
    customerPhone: 'text',
    remark: 'text',
    phone: 'text',
    address: 'text',
    QRCodeURL: 'text',
    sight: 'table',
    commoditys: 'table',
    totalPrice: 'text',
    divide1: 'polygon',
    divide2: 'polygon',
    divide3: 'polygon',
  }
  type2CompIdMap = {
    text: '0001',
    picture: '0002',
    table: '0003',
    polygon: '0004',
  }
  const locationMap = {
    title: { x: 100, y: 100 },
    printId: { x: 0, y: 160 },
    timeStamp: { x: 261, y: 160 },
    outlets: { x: 0, y: 190 },
    saleman: { x: 261, y: 190 },
    customerName: { x: 0, y: 220 },
    customerPhone: { x: 261, y: 220 },
    divide1: { x: 0, y: 250 },
    sight: { x: 0, y: 260 },
    divide2: { x: 0, y: 370 },
    commoditys: { x: 0, y: 480 },
    divide3: { x: 0, y: 490 },
    totalPrice: { x: 0, y: 500 },
    remark: { x: 0, y: 500 },
    phone: { x: 0, y: 530 },
    address: { x: 0, y: 560 },
    QRCodeURL: { x: 211, y: 600 },
  }
  const sizeMap = {
    title: { width: 322, height: 48 },
    printId: { width: 261, height: 24 },
    timeStamp: { width: 261, height: 24 },
    outlets: { width: 261, height: 24 },
    saleman: { width: 261, height: 24 },
    customerName: { width: 261, height: 24 },
    customerPhone: { width: 261, height: 24 },
    divide1: { width: 522, height: 2 },
    sight: { width: 522, height: 100 },
    divide2: { width: 522, height: 2 },
    commoditys: { width: 522, height: 100 },
    divide3: { width: 522, height: 2 },
    totalPrice: { width: 522, height: 24 },
    remark: { width: 522, height: 24 },
    phone: { width: 522, height: 24 },
    address: { width: 522, height: 24 },
    QRCodeURL: { width: 100, height: 100 },
  }

  const defaultTextOption = {
    font: {
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontSize: 24,
      italicly: false,
      underLine: false,
      color: 0x000000,
    },
    selection: {
      startIndex: 0,
      endIndex: 0,
    },
  }
  const defaultTableOption = {
    borderStyle: 'solid',
    borderWidth: '1px',
    cells: [
      {
        rowNo: 0,
        colNo: 0,
        size: {
          width: 100,
          height: 24,
        },
        font: {
          fontFamily: 'system-ui',
          fontWeight: 'normal',
          fontSize: 24,
          italicly: false,
          underLine: false,
          color: 0x000000,
        },
      },
      {
        rowNo: 0,
        colNo: 1,
        size: {
          width: 100,
          height: 24,
        },
        font: {
          fontFamily: 'system-ui',
          fontWeight: 'normal',
          fontSize: 24,
          italicly: false,
          underLine: false,
          color: 0x000000,
        },
      },
      {
        rowNo: 1,
        colNo: 0,
        size: {
          width: 100,
          height: 24,
        },
        font: {
          fontFamily: 'system-ui',
          fontWeight: 'normal',
          fontSize: 24,
          italicly: false,
          underLine: false,
          color: 0x000000,
        },
      },
      {
        rowNo: 1,
        colNo: 1,
        size: {
          width: 100,
          height: 24,
        },
        font: {
          fontFamily: 'system-ui',
          fontWeight: 'normal',
          fontSize: 24,
          italicly: false,
          underLine: false,
          color: 0x000000,
        },
      },
    ],
    //TODO：对表格的样式的抽象
  }

  const polygonOption = {
    renderType: 'fill',
    renderColor: 0x000000,
  }

  optionsMap = {
    text: defaultTextOption,
    table: defaultTableOption,
    polygon: polygonOption,
  }
  const converLocation2Path = (location, size) => {
    return [
      location,
      {
        x: location.x + size.width,
        y: location.y,
      },
      {
        x: location.x + size.width,
        y: location.y + size.height,
      },
      {
        x: location.x,
        y: location.y + size.height,
      },
    ]
  }

  //0001:文本节点
  //0002:图片节点
  //0003:表格节点
  //0004:多边形节点
  for (let i = 0; i < cusTemNum; i++) {
    const templateId = uuidv4()
    const templateType = 'customer'
    const nodeList = []
    const templateData = {
      title: '绵阳伦伦眼镜',
      printId: uuidv1().slice(0, 8),
      timeStamp: new Date().getTime(),
      outlets: '绵阳伦伦眼镜',
      saleman: '项雨伦',
      customerName: Random.cname(),
      customerPhone: mock(/^1[3-9]\d{9}$/),
      remark: Random.sentence().slice(0, 10).concat('...'),
      phone: '19921870014',
      address: '绵阳市涪城区万达广场万达公馆56-31号',
      QRCodeURL: 'dsafsd',
      sight: {
        left: {
          nearsighted: Random.integer(0, 30) * 50,
          astigmatism: Random.integer(0, 30) * 50,
          pupilDistance: Random.integer(30, 50),
        },
        right: {
          nearsighted: Random.integer(0, 30) * 50,
          astigmatism: Random.integer(0, 30) * 50,
          pupilDistance: Random.integer(30, 50),
        },
      },
      commoditys: [
        {
          commodityId: uuidv4(),
          name: '隐形眼镜护理液',
          num: 1,
          unitPrice: 60,
        },
        {
          commodityId: uuidv4(),
          name: '隐形眼镜护理液',
          num: 1,
          unitPrice: 60,
        },
      ],
      totalPrice: 120,
    }
    for (const [propName, type] of Object.entries(cusTemProp2TypeMap)) {
      const path = converLocation2Path(locationMap[propName], sizeMap[propName])
      const sectionIndex =
        cusTemProp2TypeMap[propName] === 'text' && templateData[propName].length
      nodeList.push({
        componentId: type2CompIdMap[type],
        instanceId: uuidv4(),
        location: locationMap[propName],
        size: sizeMap[propName],
        path,
        layer: nodeList.length + 1,
        isActive: false,
        type,
        options: {
          ...optionsMap[type],
          selection: { startIndex: sectionIndex, endIndex: sectionIndex },
        },
        propName,
      })
    }

    await TemplateService.createTemplate({
      templateId,
      templateType,
      nodeList,
      templateData,
    })
  }
  for (let i = 0; i < opTemNum; i++) {
    const tmplateId = uuidv4()
  }
}
async function main() {
  await initCustomer()
  await computeStatics()
  await initTemplate()
  process.exit()
}

main()
