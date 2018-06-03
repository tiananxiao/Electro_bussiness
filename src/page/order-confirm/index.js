/*
 * @Author: Lizh
 * @Date:   2018-05-11 14:14:57
 * @Last Modified by:   15156
 * @Last Modified time: 2018-06-03 12:35:26
 */

require('./index.css');
require('page/common/header/index.js');
var nav = require('page/common/nav/index.js');
var _mm = require('util/mm.js');
var templateAddress = require('./address.string');
var templateOrderProduct = require('./orderProduct.string');
var addressModel = require('./address-model.js');
var _address = require('service/address-service.js');
var _order = require('service/order-service.js');
var page = {
    data: {

    },
    //页面初始化
    init: function() {
        this.onLoad();
        this.bindEvent();
    },
    //加载页面
    onLoad: function() {
        this.loadAddress();
        this.loadOrderProduct();
    },
    // 绑定事件
    bindEvent: function() {
        var _this = this;
        // 选择收货地址并缓存
        $(document).on('click', '.address-item', function() {
            var $this = $(this);
            // 再次点击同一个时取消选中
            if (_this.data.selectedShippingId && $this.hasClass('active')) {
                _this.data.selectedShippingId = null;
                $this.removeClass('active');
            }
            // 更新购物车商品数量
            else {
                _this.data.selectedShippingId = $this.data('shippingid');
                $this.addClass('active').siblings().removeClass('active');
            }
        });
        // 提交订单按钮
        $(document).on('click', '.order-submit', function() {
            var $this = $(this),
                shippingId = _this.data.selectedShippingId;
            if (!shippingId) {
                _mm.errorTips('您尚未选择收货地址，请选择！');
            } else {
                _order.creatOrder({
                    shippingId: shippingId
                }, function(res) {
                    window.location.href = './payment.html?orderNo=' + res.orderNo;
                }, function(errMsg) {
                    _mm.errorTips(errMsg);
                });
            }
        });
        //加载地址模块，添加新地址
        $(document).on('click', '.address-new', function() {
            addressModel.show({
                isUpdate: false,
                onSuccess: function() {
                    _this.loadAddress();
                }
            });
        });
        //加载地址模块,更新地址
        $(document).on('click', '.edit', function(e) {
            var selectedShippingId = $(this).parents('.address-item').data('shippingid');
            //避免点击编辑也触发选择收货地址
            e.stopPropagation();
            _address.selectAddress(selectedShippingId, function(res) {
                addressModel.show({
                    data: res,
                    isUpdate: true,
                    onSuccess: function() {
                        _this.loadAddress();
                    }
                });
            }, function(errMsg) {
                _mm.errorTips(errMsg);
            });
        });
        //删除地址模块
        $(document).on('click', '.delect', function(e) {
            var selectedShippingId = $(this).parents('.address-item').data('shippingid');
            //避免点击删除也触发选择收货地址
            e.stopPropagation();
            if (window.confirm('您确定要删除该地址吗？')) {
                _address.delectAddress({
                    shippingId: selectedShippingId
                }, function(res) {
                    _this.loadAddress();
                }, function(errMsg) {
                    _mm.errorTips(errMsg);
                });
            }
        });
    },
    //加载地址列表
    loadAddress: function() {
        var _this = this;
        $addressList = $('.address-list');
        _address.getAddressList({
            pageNum: 1,
            pageSize: 50
        }, function(res) {
            _this.filter(res);
            var AddressHtml = _mm.renderHtml(templateAddress, res);
            $addressList.html(AddressHtml);
        }, function(errMsg) {
            $addressList.html('<p class="err-tip">好像哪里出问题了，请重新加载！</p>');
        });
    },
    //过滤参数，使删除地址后之前选中地址状态保留
    filter: function(data) {
        var _this = this;
        if (this.data.selectedShippingId) {
            for (var i = 0, _length = data.list.length; i < _length; i++) {
                if (data.list[i].id === this.data.selectedShippingId) {
                    data.list[i].isActive = true;
                }
            }
        }
    },
    //加载订单商品列表
    loadOrderProduct: function() {
        $OrderProduct = $('.order-product');
        _order.getOrderProduct(function(res) {
            var OrderProductHtml = _mm.renderHtml(templateOrderProduct, res);
            $OrderProduct.html(OrderProductHtml);
        }, function(errMsg) {
            $OrderProduct.html('<p class="err-tip">好像哪里出问题了，请重新加载！</p>');
        });
    }
};
$(function() {
    page.init();
});