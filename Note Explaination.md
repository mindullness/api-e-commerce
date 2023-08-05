///////////////
curl http://localhost --include: xem những header của hệ thống trong file 'curl'

///////////////
utils vs helper
    utils: file để viết những function, tần xuất sử dụng nhiều
      Eg: Convert Uppercase to Lowercase, int => String, resize(pixel) Images, ....
    helper: Ủy quyền, khi nào cần giúp thì mới gọi


///////////////
Trong MongoDb 'không cần' đóng kết nối disConnect() liên tục như Oracle

///////////////
Config vs .ENV
  - Config: Save the configurations info data
  - ENV: Save the responsive info data

///////////////
MongoDb Collection:
 - 1 document: 16MB maximum
 - 100 nested object allowed
 - MongoDb recommends 1 server should use 64Gb RAM 
   for an e-commerce database, and be able to store > 50 mil products