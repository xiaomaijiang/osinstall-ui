import Ember from 'ember';

export default Ember.Controller.extend({
	hardwareSrv: Ember.inject.service('api/hardware/service'),
	page:1,
	pageCount:1,
	pageSize:10,
    Company:null,
    Product:null,
    ModelName:null,
    IsSystemAdd:"Yes",

    CompanyChange: function() {
      var self = this;
      var company = this.get('Company');
      self.set('model.modelNameData', null);
      self.set('Product', null);
      self.set('ModelName', null);
        this.get("hardwareSrv").getProductByCompanyAndGroup(company).then(function(data){
            self.set('model.productData', data.Content);
        });
    }.observes("Company"),

    ProductChange: function() {
      var self = this;
      var company = this.get('Company');
      var product = this.get('Product');
        this.get("hardwareSrv").getModelNameByCompanyAndProductAndGroup(company,product).then(function(data){
            self.set('model.modelNameData', data.Content);
        });
    }.observes("Product"),

	actions:{
		queryAction:function(){
			this.send("pageChanged",this.get("page"));
		},
        searchAction:function(){
            this.send("pageChanged",this.get("page"));
        },
		pageChanged:function(page){
			var self = this;
			this.set("page",page);
			var pageSize = this.get("pageSize");

            var company = this.get('Company');
            var product = this.get('Product');
            var modelName = this.get('ModelName');
            var isSystemAdd = this.get('IsSystemAdd');

			this.get("hardwareSrv").list(pageSize,(page-1)*pageSize,company,product,modelName,isSystemAdd).then(function(data){
                self.set('rowList', data.Content.list);
                var pageCount = Math.ceil(data.Content.recordCount/pageSize);
                if(pageCount <= 0){
                	pageCount = 1;
                }
                self.set('pageCount',pageCount);
            });
		},
		deleteAction: function(id) {
            if(confirm("确认删除吗？")){
    			var self = this;
            	self.get("hardwareSrv").deleteRowById(id).then(function(data) {
                    if(data.Status==="success"){
                        Ember.$.notify({
                        	message: "删除成功!"
                        }, {
                        	animate: {
                        		enter: 'animated fadeInRight',
                        		exit: 'animated fadeOutRight'
                        	},
                        	type: 'success'
                        });
                        //self.transitionToRoute('dashboard.os.list');
                        self.send("pageChanged",self.get("page"));
                        self.CompanyChange();
                        self.ProductChange();
                    } else {
                        Ember.$.notify({
                        	title: "<strong>保存失败:</strong>",
                        	message: data.Message
                        }, {
                        	animate: {
                        		enter: 'animated fadeInRight',
                        		exit: 'animated fadeOutRight'
                        	},
                        	type: 'danger'
                        });
                    }
                });
            }
        },
	}
});