/*
 *命令式使用 Vue 和 Element UI 中的 ImageViewer 组件进行图片预览
 */

import Vue from "vue";
import ImageViewer from "element-ui/packages/image/src/image-viewer.vue";

/**
 * 预览图片
 * @param {Object} options - 选项参数
 * @param {Array} options.urlList - 图片地址列表
 */
function previewImages(options) {
  const { urlList } = options;
  if (!Array.isArray(urlList) || urlList.length === 0) {
    console.error(
      "[Vue Element Error][ImageViewer] urlList should be a non-empty array"
    );
    return;
  }
  buildComponentInBody(ImageViewer, options);
}

/**
 * 在 body 中构建组件
 * @param {Object} component - 组件对象
 * @param {Object} props - 组件属性
 * @returns {Function} - 销毁组件的方法
 */
function buildComponentInBody(component, props) {
  let disposer = null;
  const onClose = () => disposer && disposer();
  const mountComponent = (component) => {
    const Component = Vue.extend(component);
    const instance = new Component({
      propsData: { ...props, onClose },
    }).$mount();
    document.body.appendChild(instance.$el);
    return () => {
      instance.$destroy();
    };
  };

  disposer = mountComponent(component);
}

export { previewImages, buildComponentInBody };
