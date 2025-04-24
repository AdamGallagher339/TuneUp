import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: 'tsconfig.json',
      // Add Ionic compatibility
      jit: true
    })
  ],
  build: {
    target: 'es2022',
    // Add for Firebase
    commonjsOptions: {
        include: [/firebase/, /@angular\/fire/, /node_modules/]
  }
}
});