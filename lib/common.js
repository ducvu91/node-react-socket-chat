// This file handles the function helper app

var common = {
    checkError : function(data){
        var reg_mail = /^[A-Za-z0-9]+([_\.\-]?[A-Za-z0-9])*@[A-Za-z0-9]+([\.\-]?[A-Za-z0-9]+)*(\.[A-Za-z]+)+$/;
        var error = {};

        if(data.email.length < 6)
        {
            error.reg_email = 'Email phai lon hon 6 ky tu';
        }
        else if (reg_mail.test(data.email) === false)
        {
            error.reg_email = 'Email khong dung dinh dang';
        }

        if(data.password.length < 6)
        {
            error.reg_password = 'Mat khau phai lon hon 6 ky tu';
        }
        else if(data.password != data.repassword)
        {
            error.reg_repassword = 'Mat khau xac nhan khong dung';
        }

        if(data.full_name.length < 6)
        {
            error.reg_fullname = 'Ho va Ten phai lon hon 6 ky tu';
        }

        if(data.phone.length < 9 || data.phone.length > 12)
        {
            error.reg_phone = 'So Dien Thoai phai nam trong khoang 10 den 12 ky tu';
        }
        else if(!common.isNumeric(data.phone))
        {
            error.reg_phone = 'So Dien Thoai phai la kieu so';
        }
        return error;
    },

    isNumeric : function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

module.exports = common;