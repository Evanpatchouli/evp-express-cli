const tsconfig = 
`{
  "compilerOptions": {
    // ========== 基础环境配置 ==========
    "target": "ES2022",                     // 建议用ES2022，更稳定
    "lib": ["ES2022"],
    "module": "commonjs",                   // Node.js推荐
    "moduleResolution": "node",             // CommonJS需配node
    
    // ========== 模块互操作性配置 ==========
    "esModuleInterop": true,                // 启用CommonJS/ES模块互操作
    "allowSyntheticDefaultImports": true,   // 允许合成默认导入
    "resolveJsonModule": true,              // 允许导入JSON
    
    // ========== 输出文件配置 ==========
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    
    // ========== 严格类型检查 ==========
    "strict": true,                         // 启用所有严格检查
    
    // 可选：严格检查选项（根据项目需求）
    "noUncheckedIndexedAccess": true,       // 严格索引访问
    "exactOptionalPropertyTypes": true,     // 精确可选属性类型
    "noImplicitReturns": true,              // 推荐：函数必须明确返回
    "noFallthroughCasesInSwitch": true,     // 推荐：switch必须处理所有情况
    
    // ========== 其他配置 ==========
    "skipLibCheck": true,                   // 跳过库类型检查，加速编译
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    
    // ⚠️ 注意：以下是针对前端React的设置，Node.js项目通常不需要
    // "jsx": "react-jsx",                  // 如果不用React，请删除
    // "verbatimModuleSyntax": false,       // 与commonjs不兼容
    // "isolatedModules": true,             // 与commonjs不兼容
    // "noUncheckedSideEffectImports": true,// ES2023+特性
    // "moduleDetection": "force",          // ES模块检测
    
    // ========== 路径和输出配置 ==========
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
  },
  
  // ========== 包含/排除文件 ==========
  "include": ["src/**/*.ts"],              // 只包含TypeScript文件
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.test.js",
    "**/*.spec.js"
  ]
}
`;

module.exports = {
  name: 'tsconfig.json',
  content: tsconfig,
  dependencies: [
    "typescript@4 -D"
  ],
}