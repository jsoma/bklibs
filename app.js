(function(global) {
	"use strict";

	var MadLib = {};

	MadLib.Game = function(options) {
		if(typeof(options) === 'undefined')
			options = {};

		this.blank_class = options.blank_class || '.blank';
		this.$element = $(options.element || ".madlib");

		this.blanks = $(this.blank_class).map( function(i, blank) {
			return new MadLib.Blank({element: blank, index: i});
		});

		this.renderForm();
	}

	MadLib.Game.prototype.renderForm = function() {
		this.form = new MadLib.Form({game: this, blanks: this.blanks});
		this.$element.append(this.form.$element);
	}

	MadLib.Game.prototype.renderResult = function() {
		$.each(this.blanks, function() {
			this.fill();
		});
		this.$element.find(".content").show();
	}

	MadLib.Game.prototype.blanks = function() {
		this.$element.find("." + this.blank_class);
	}

	MadLib.Form = function(options) {
		this.game = options.game;
		this.blanks = options.blanks;
		this.$element = $($("#form-template").html());

		var that = this;
		this.$element.submit( function(e) {
			e.preventDefault();
			that.submit();
		});

		this.view_button = this.$element.find(".view-btn");
		this.view_button.click( function() {
				that.viewResult();
			});
		this.render();
		this.setCurrentIndex(0);
	}

	MadLib.Form.prototype.setCurrentIndex = function(index) {
		if(index >= this.blanks.length || index === -1) {
			return false;
		}

		this.view_button.hide();

		if(index === this.blanks.index(this.current_blank)) {
			return true;
		}

		var old = this.current_blank;

		this.current_blank = this.blanks[index];
		this.current_blank.activate();

		if(typeof(old) !== 'undefined')
			old.deactivate();
		
		
		return true;
	}

	MadLib.Form.prototype.next = function() {
		if(this.current_blank.value() === '')
			return true;

		var first_empty = this.blanks.filter( function(element) {
			return this.value() === '';
		})
		// var new_index = this.blanks.index(this.current_blank) + 1;
		var new_index = this.blanks.index(first_empty);

		this.current_blank.resetListItem();
		return this.setCurrentIndex(new_index);
	}

	MadLib.Form.prototype.submit = function(e) {
		this.updateProgress();
		if(!this.next()) {
			this.view_button.show();
			this.$element.find(".editing").removeClass("editing");
			this.current_blank.$input.blur();
			this.current_blank = null;
		}
	}

	MadLib.Form.prototype.viewResult = function(e) {
		this.$element.hide();
		this.game.renderResult();
	}

	MadLib.Form.prototype.updateProgress = function() {
		var completion = $('form fieldset input:text').filter(function() { return $(this).val() != ""; }).length /
			$('form fieldset input:text').length
			* 100;
		this.$element.find(".fill").animate({width: completion + '%'}, 150)
	}

	MadLib.Form.prototype.validate = function() {
		return true;
	}

	MadLib.Form.prototype.renderErrors = function() {
		console.log("Rendering errors");
	}

	MadLib.Form.prototype.render = function() {
		var that = this;
		this.$element.append()
		$.each(this.blanks, function(i, blank) {
			blank.$fieldset.find(".btn").on('click', function() {
				that.submit();
			})
			that.$element.append(blank.$fieldset);
			that.$element.find("ul").append(blank.$list_item);
		});
		return this.$element;
	}

	MadLib.Blank = function(options) {
		this.element = options.element;
		this.form = options.form;
		this.index = options.index;
		this.$element = $(options.element);

		this.prompt = this.$element.data('prompt');
		this.example = this.$element.data('example');

		this.$element.append("<span class='prompt'></span>").attr(this.prompt);
		this.$element.append("<span class='answer'></span>");

		this.$list_item = $("<li></li>")
		this.$fieldset = $($("#blank-template").html());
		this.$fieldset.find(".type").text(this.prompt);

		this.$input = this.$fieldset.find("input");
		this.$input.attr('placeholder', this.prompt);

		var that = this;
		this.$list_item.on('click', function() {
			global.game.form.setCurrentIndex(that.index);
		});

		this.$input
			.keypress( function(e) {
				that.$fieldset.addClass('completed');
				return true;
			})
			.keyup( function(e) {
				if($(this).val() !== '') {
					that.$fieldset.addClass('completed');
				} else {
					that.$fieldset.removeClass('completed');
				}
				return true;
			})
	}

	MadLib.Blank.prototype.resetListItem = function() {
		this.$list_item.html("<div class='result'>" + this.$input.val() + "</div><div class='desc'>" + this.prompt + "</div>");
		this.$list_item.addClass('active');			
	}

	MadLib.Blank.prototype.activate = function() {
		this.$fieldset.addClass("active")
		this.$list_item.addClass("editing")
		// this.$fieldset.find("h3").fitText();
		var that = this;
		that.$input.focus();
	}

	MadLib.Blank.prototype.deactivate = function() {
		this.$fieldset.removeClass("active");
		this.$list_item.removeClass("editing")
	}

	MadLib.Blank.prototype.value = function() {
		return this.$fieldset.find("input").val();
	}

	MadLib.Blank.prototype.fill = function() {
		this.$element.find(".answer").text(this.value());
	}

	global.MadLib = MadLib;
})(this);
