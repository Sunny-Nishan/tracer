import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from 'react-native';
//@ts-ignore
import Spinner from 'react-native-loading-spinner-overlay';
import CountryPicker, {
  Country,
  FlagButton,
} from 'react-native-country-picker-modal';
import {colors} from 'theme';
import {firebaseAuth} from 'firebase';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

const api = () => {};
const MAX_LENGTH_CODE = 6;
const MAX_LENGTH_NUMBER = 20;

// if you want to customize the country picker
const countryPickerCustomStyles = {};

// your brand's theme primary color
const brandColor = colors['cool-blue-80'];

interface IState {
  enterCode: boolean;
  error?: string;
  spinner: boolean;
  country: {
    cca2: string;
    callingCode: string;
  };
}

export class Login extends Component<any, IState> {
  textInputValue = null;
  confirmation = null;
  constructor(props: any) {
    super(props);

    this.state = {
      enterCode: false,
      spinner: false,
      country: {
        cca2: 'IN',
        callingCode: '91',
      },
    };
  }

  _getCode = async () => {
    this.setState({spinner: true});
    const phone = this.textInputValue;
    if (!phone) {
      Alert.alert('Please enter a phone number');
      return;
    }

    try {
      console.log('phone ', this.state);
      const phoneWithCC =
        '+' + this.state.country.callingCode + this.textInputValue;
      console.log('phone withcc ', phoneWithCC);
      this.confirmation = await firebaseAuth.signInWithPhoneNumber(phoneWithCC);
      this.setState({enterCode: true});
    } catch (e) {
      Alert.alert('Something went wrong', e.message);
      console.log('Error ', e);
    } finally {
      this.setState({spinner: false});
    }
  };

  _verifyCode = async () => {
    this.setState({spinner: true});
    try {
      await this.confirmation.confirm(this.textInputValue);
    } catch (e) {
      // Handle error
    } finally {
      this.setState({spinner: false});
    }
  };

  _onChangeText = val => {
    this.textInputValue = val;
  };

  _tryAgain = () => {
    this.setState({enterCode: false});
  };

  _getSubmitAction = () => {
    this.state.enterCode ? this._verifyCode() : this._getCode();
  };

  _changeCountry = (country: Country) => {
    this.setState({country});
    // this.refs.form.refs.textInput.focus();
  };

  _renderFooter = () => {
    if (this.state.enterCode) return null;

    return (
      <View>
        <Text style={styles.disclaimerText}>
          By tapping "Send confirmation code" above, we will send you an SMS to
          confirm your phone number.
        </Text>
      </View>
    );
  };

  toggleCountryPicker = () => {
    this.setState({showCountryPicker: !this.state.showCountryPicker});
  };

  _renderCountryPicker = () => {
    if (this.state.enterCode) return <View />;

    return (
      <CountryPicker
        ref={'countryPicker'}
        closeable
        placeholder=""
        visible={this.state.showCountryPicker}
        onClose={this.toggleCountryPicker}
        style={styles.countryPicker}
        onChange={this._changeCountry}
        cca2={this.state.country.cca2}
        styles={countryPickerCustomStyles}
        onSelect={this._changeCountry}
        withEmoji
        withCallingCode
        withFilter
      />
    );
  };

  _renderCallingCode = () => {
    if (this.state.enterCode) return <View />;

    return (
      <View style={styles.callingCodeView}>
        <FlagButton
          countryCode={this.state.country.cca2}
          onOpen={this.toggleCountryPicker}
          withCallingCodeButton
        />
      </View>
    );
  };

  render() {
    let headerText = `${
      this.state.enterCode
        ? 'Enter verification code'
        : 'Enter your Phone number'
    }`;
    let buttonText = this.state.enterCode
      ? 'Verify confirmation code'
      : 'Send confirmation code';
    let textStyle = this.state.enterCode
      ? {
          height: 50,
          textAlign: 'center',
          fontFamily: 'Courier',
        }
      : {};

    return (
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <Text style={styles.header}>{headerText}</Text>

          <View style={styles.form}>
            <View style={{alignItems: 'center', marginBottom: 20}}>
              {this._renderCountryPicker()}
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity onPress={this.toggleCountryPicker}>
                {this._renderCallingCode()}
              </TouchableOpacity>
              {this.state.enterCode ? (
                <TextInput
                  name={this.state.enterCode ? 'code' : 'textInputValue'}
                  key="phone"
                  type={'TextInput'}
                  underlineColorAndroid={'transparent'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  onChangeText={this._onChangeText}
                  placeholder={this.state.enterCode ? 'OTP' : 'Phone Number'}
                  keyboardType={
                    Platform.OS === 'ios' ? 'number-pad' : 'numeric'
                  }
                  style={[styles.textInput, textStyle]}
                  returnKeyType="go"
                  autoFocus
                  placeholderTextColor={brandColor}
                  selectionColor={brandColor}
                  maxLength={this.state.enterCode ? 6 : 20}
                  onSubmitEditing={this._getSubmitAction}
                />
              ) : (
                <TextInput
                  key="otp"
                  name={this.state.enterCode ? 'code' : 'textInputValue'}
                  type={'TextInput'}
                  underlineColorAndroid={'transparent'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  onChangeText={this._onChangeText}
                  placeholder={this.state.enterCode ? 'OTP' : 'Phone Number'}
                  keyboardType={
                    Platform.OS === 'ios' ? 'number-pad' : 'numeric'
                  }
                  style={[styles.textInput, textStyle]}
                  returnKeyType="go"
                  autoFocus
                  placeholderTextColor={brandColor}
                  selectionColor={brandColor}
                  maxLength={this.state.enterCode ? 6 : 20}
                  onSubmitEditing={this._getSubmitAction}
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={this._getSubmitAction}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>

            {this._renderFooter()}
          </View>

          <Spinner
            color={colors['cool-blue-80']}
            visible={this.state.spinner}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  countryPicker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 22,
    margin: 20,
    color: '#4A4A4A',
  },
  form: {
    margin: 20,
  },
  textInput: {
    padding: 0,
    margin: 0,
    flex: 1,
    fontSize: 20,
    color: brandColor,
  },
  button: {
    marginTop: 20,
    height: 50,
    backgroundColor: brandColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Helvetica',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wrongNumberText: {
    margin: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  disclaimerText: {
    marginTop: 30,
    fontSize: 12,
    color: 'grey',
  },
  callingCodeView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  callingCodeText: {
    fontSize: 20,
    color: brandColor,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    paddingRight: 10,
  },
  underlineStyleBase: {
    width: 30,
    height: 45,
    color: colors['cool-blue-100'],
    borderWidth: 0,
    borderColor: colors['cool-black-80'],
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: colors['cool-blue-100'],
  },
});
